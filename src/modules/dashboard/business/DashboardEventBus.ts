import { EventEmitter } from "node:events";

/**
 * DashboardEventBus — event bus internal untuk modul dashboard.
 *
 * Dipanggil oleh modul lain (mis. KontrolTiket) saat ada perubahan
 * data yang relevan untuk dashboard. DashboardWsManager mendengarkan
 * event ini dan meneruskan update ke klien WebSocket.
 *
 * Event yang tersedia:
 *   "tiket:dibuat" — dipicu saat tiket baru berhasil disimpan ke DB
 */
class DashboardEventBusClass extends EventEmitter {
  /** Dipanggil oleh KontrolTiket setelah tiket baru berhasil dibuat. */
  tiketDibuat(): void {
    this.emit("tiket:dibuat");
  }

  /** Daftarkan listener untuk event tiket baru. */
  onTiketDibuat(listener: () => void): void {
    this.on("tiket:dibuat", listener);
  }

  /** Hapus listener (untuk cleanup saat koneksi WS ditutup). */
  offTiketDibuat(listener: () => void): void {
    this.off("tiket:dibuat", listener);
  }
}

export const DashboardEventBus = new DashboardEventBusClass();
