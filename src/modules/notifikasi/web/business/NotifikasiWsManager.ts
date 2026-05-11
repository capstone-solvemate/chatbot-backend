import type { IWsSessionHandler } from "~/core/ws/IWsSessionHandler.js";

import type { KoneksiNotifikasi } from "./KoneksiNotifikasi.js";

/**
 * NotifikasiWsManager — mengelola koneksi WebSocket aktif dengan dual-index:
 * - byPengguna: untuk push notifikasi baru ke semua tab pengguna yang sama
 * - bySession: untuk invalidasi semua koneksi saat logout
 */
export class NotifikasiWsManager implements IWsSessionHandler {
  private readonly byPengguna = new Map<number, Set<KoneksiNotifikasi>>();
  private readonly bySession = new Map<string, Set<KoneksiNotifikasi>>();

  tambah(koneksi: KoneksiNotifikasi): void {
    if (!this.byPengguna.has(koneksi.idPengguna)) {
      this.byPengguna.set(koneksi.idPengguna, new Set());
    }
    this.byPengguna.get(koneksi.idPengguna)!.add(koneksi);

    if (!this.bySession.has(koneksi.idSession)) {
      this.bySession.set(koneksi.idSession, new Set());
    }
    this.bySession.get(koneksi.idSession)!.add(koneksi);
  }

  hapus(koneksi: KoneksiNotifikasi): void {
    const setPengguna = this.byPengguna.get(koneksi.idPengguna);
    if (setPengguna) {
      setPengguna.delete(koneksi);
      if (setPengguna.size === 0) {
        this.byPengguna.delete(koneksi.idPengguna);
      }
    }

    const setSession = this.bySession.get(koneksi.idSession);
    if (setSession) {
      setSession.delete(koneksi);
      if (setSession.size === 0) {
        this.bySession.delete(koneksi.idSession);
      }
    }
  }

  kirim(idPengguna: number, pesan: object): void {
    const koneksiSet = this.byPengguna.get(idPengguna);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify(pesan);
    for (const koneksi of koneksiSet) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
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

      const setPengguna = this.byPengguna.get(koneksi.idPengguna);
      if (setPengguna) {
        setPengguna.delete(koneksi);
        if (setPengguna.size === 0) {
          this.byPengguna.delete(koneksi.idPengguna);
        }
      }
    }

    this.bySession.delete(idSession);
  }
}
