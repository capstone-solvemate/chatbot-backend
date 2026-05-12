import type { WebSocket } from "ws";

import type { IWsSessionHandler } from "~/core/ws/IWsSessionHandler.js";

import type { FilterDashboard } from "../domain/DashboardPayload.js";
import type { KontrolDashboard } from "./KontrolDashboard.js";

type KoneksiChatbotMonitoring = {
  ws: WebSocket;
  idSession: string;
  filter: FilterDashboard;
};

export class ChatbotMonitoringWsManager implements IWsSessionHandler {
  constructor(private readonly kontrolDashboard: KontrolDashboard) {}

  private readonly bySession = new Map<string, Set<KoneksiChatbotMonitoring>>();

  async tambahKoneksi(ws: WebSocket, idSession: string, filter: FilterDashboard): Promise<void> {
    const koneksi: KoneksiChatbotMonitoring = { ws, idSession, filter };
    this.tambah(koneksi);

    await this.kirimPayload(koneksi);

    ws.on("message", (raw) => {
      this.tanganiPesanMasuk(koneksi, raw.toString());
    });

    ws.on("close", () => {
      this.hapus(koneksi);
    });

    ws.on("error", (err) => {
      console.error(new Date().toISOString(), "[ChatbotMonitoringWsManager] WS error:", err);
      this.hapus(koneksi);
    });
  }

  async broadcastJikaCocok(tanggal: Date): Promise<void> {
    const tahun = tanggal.getFullYear();
    const bulan = tanggal.getMonth() + 1;

    for (const koneksiSet of this.bySession.values()) {
      for (const koneksi of koneksiSet) {
        const f = koneksi.filter;
        const tahunCocok = f.tahun === tahun;
        const bulanCocok = f.bulan === undefined || f.bulan === bulan;

        if (tahunCocok && bulanCocok) {
          await this.kirimPayload(koneksi).catch((err) => {
            console.error(new Date().toISOString(), "[ChatbotMonitoringWsManager] Gagal kirim payload:", err);
          });
        }
      }
    }
  }

  invalidasiSession(idSession: string): void {
    const koneksiSet = this.bySession.get(idSession);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify({ type: "session_expired" });
    for (const koneksi of koneksiSet) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
        koneksi.ws.close();
      }
    }
    this.bySession.delete(idSession);
  }

  private tambah(koneksi: KoneksiChatbotMonitoring): void {
    if (!this.bySession.has(koneksi.idSession)) {
      this.bySession.set(koneksi.idSession, new Set());
    }
    this.bySession.get(koneksi.idSession)!.add(koneksi);
  }

  private hapus(koneksi: KoneksiChatbotMonitoring): void {
    const set = this.bySession.get(koneksi.idSession);
    if (set) {
      set.delete(koneksi);
      if (set.size === 0) {
        this.bySession.delete(koneksi.idSession);
      }
    }
  }

  private async kirimPayload(koneksi: KoneksiChatbotMonitoring): Promise<void> {
    if (koneksi.ws.readyState !== koneksi.ws.OPEN)
      return;
    const payload = await this.kontrolDashboard.buatPayloadChatbot(koneksi.filter);
    koneksi.ws.send(JSON.stringify(payload));
  }

  private tanganiPesanMasuk(koneksi: KoneksiChatbotMonitoring, raw: string): void {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.filter && typeof parsed.filter.tahun === "number") {
        const { tahun, bulan } = parsed.filter;
        const filterBaru: FilterDashboard = { tahun };
        if (typeof bulan === "number" && bulan >= 1 && bulan <= 12) {
          filterBaru.bulan = bulan;
        }
        koneksi.filter = filterBaru;
        this.kirimPayload(koneksi).catch((err) => {
          console.error(new Date().toISOString(), "[ChatbotMonitoringWsManager] Gagal kirim setelah filter berubah:", err);
        });
      }
    }
    catch {
      // Pesan tidak valid — abaikan
    }
  }
}
