import type { WebSocket } from "ws";

import type { IWsSessionHandler } from "~/core/ws/IWsSessionHandler.js";

import type { FilterDashboard } from "../domain/DashboardPayload.js";

import { DashboardEventBus } from "./DashboardEventBus.js";
import { KontrolDashboard } from "./KontrolDashboard.js";

/** Satu koneksi WS dashboard yang aktif. */
type KoneksiDashboard = {
  ws: WebSocket;
  idSession: string;
  filter: FilterDashboard;
  onEvent: () => void;
};

/**
 * DashboardWsManager — mengelola semua koneksi WebSocket dashboard.
 *
 * Tidak melakukan autentikasi — itu sudah ditangani di api/dashboard.ts
 * sebelum koneksi ini didaftarkan, persis seperti pola di api/chat.ts.
 *
 * Setiap koneksi:
 *   1. Langsung mendapat payload awal setelah didaftarkan.
 *   2. Mendapat payload baru otomatis setiap kali ada event "tiket:dibuat".
 *   3. Dapat mengirim pesan JSON untuk mengubah filter tanpa reconnect.
 *
 * Pesan dari klien (JSON):
 *   { "filter": { "tahun": 2026, "bulan": 4 } }
 */
export class DashboardWsManager implements IWsSessionHandler {
  static readonly instance = new DashboardWsManager();
  private constructor() {}

  private readonly kontrolDashboard = KontrolDashboard.instance;
  private readonly bySession = new Map<string, Set<KoneksiDashboard>>();

  /**
   * Daftarkan koneksi baru. Dipanggil dari api/dashboard.ts setelah
   * autentikasi dan validasi peran berhasil.
   */
  async tambahKoneksi(ws: WebSocket, idSession: string, filter: FilterDashboard): Promise<void> {
    const koneksi: KoneksiDashboard = {
      ws,
      idSession,
      filter,
      onEvent: () => {
        this.kirimPayload(koneksi).catch((err) => {
          console.error(new Date().toISOString(), "[DashboardWsManager] Gagal kirim payload:", err);
        });
      },
    };

    this.tambah(koneksi);
    DashboardEventBus.onTiketDibuat(koneksi.onEvent);

    // Kirim payload awal segera
    await this.kirimPayload(koneksi);

    ws.on("message", (raw) => {
      this.tanganiPesanMasuk(koneksi, raw.toString());
    });

    ws.on("close", () => {
      this.hapus(koneksi);
    });

    ws.on("error", (err) => {
      console.error(new Date().toISOString(), "[DashboardWsManager] WS error:", err);
      this.hapus(koneksi);
    });
  }

  /**
   * Dipanggil oleh WsSessionRegistry saat admin logout.
   * Menutup semua koneksi dashboard milik session tersebut.
   */
  invalidasiSession(idSession: string): void {
    const koneksiSet = this.bySession.get(idSession);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify({ type: "session_expired" });
    for (const koneksi of koneksiSet) {
      DashboardEventBus.offTiketDibuat(koneksi.onEvent);
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
        koneksi.ws.close();
      }
    }

    this.bySession.delete(idSession);
  }

  private tambah(koneksi: KoneksiDashboard): void {
    if (!this.bySession.has(koneksi.idSession)) {
      this.bySession.set(koneksi.idSession, new Set());
    }
    this.bySession.get(koneksi.idSession)!.add(koneksi);
  }

  private hapus(koneksi: KoneksiDashboard): void {
    DashboardEventBus.offTiketDibuat(koneksi.onEvent);

    const set = this.bySession.get(koneksi.idSession);
    if (set) {
      set.delete(koneksi);
      if (set.size === 0) {
        this.bySession.delete(koneksi.idSession);
      }
    }
  }

  private async kirimPayload(koneksi: KoneksiDashboard): Promise<void> {
    if (koneksi.ws.readyState !== koneksi.ws.OPEN)
      return;

    const payload = await this.kontrolDashboard.buatPayload(koneksi.filter);
    koneksi.ws.send(JSON.stringify(payload));
  }

  /**
   * Tangani pesan filter baru dari klien.
   * Format: { "filter": { "tahun": 2026, "bulan": 5 } }
   * Pesan tidak valid diabaikan secara diam-diam.
   */
  private tanganiPesanMasuk(koneksi: KoneksiDashboard, raw: string): void {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.filter && typeof parsed.filter.tahun === "number") {
        const { tahun, bulan, minggu } = parsed.filter;

        const filterBaru: FilterDashboard = { tahun };
        if (typeof bulan === "number" && bulan >= 1 && bulan <= 12) {
          filterBaru.bulan = bulan;
          if (typeof minggu === "number" && minggu >= 1 && minggu <= 5) {
            filterBaru.minggu = minggu;
          }
        }

        koneksi.filter = filterBaru;
        this.kirimPayload(koneksi).catch((err) => {
          console.error(new Date().toISOString(), "[DashboardWsManager] Gagal kirim setelah filter berubah:", err);
        });
      }
    }
    catch {
      // Pesan tidak valid — abaikan
    }
  }
}
