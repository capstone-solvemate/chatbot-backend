import type { TiketEventBus } from "~/modules/tiket/event/TiketEventBus.js";

import type { KontrolNotifikasi } from "../business/KontrolNotifikasi.js";

/**
 * NotifikasiSubscriber — hanya bertanggung jawab mendaftarkan listener
 * ke TiketEventBus dan meneruskannya ke KontrolNotifikasi.
 *
 * Tidak ada logika bisnis di sini.
 */
export class NotifikasiSubscriber {
  constructor(
    private readonly tiketEventBus: TiketEventBus,
    private readonly kontrolNotifikasi: KontrolNotifikasi,
  ) {}

  registerSubscribers(): void {
    this.tiketEventBus.on("tiket_dibuat", payload =>
      this.kontrolNotifikasi.tanganiTiketDibuat(payload).catch(err =>
        console.error(new Date().toISOString(), "[NotifikasiSubscriber] tanganiTiketDibuat error:", err),
      ));

    this.tiketEventBus.on("status_diubah", payload =>
      this.kontrolNotifikasi.tanganiStatusDiubah(payload).catch(err =>
        console.error(new Date().toISOString(), "[NotifikasiSubscriber] tanganiStatusDiubah error:", err),
      ));

    this.tiketEventBus.on("pesan_baru", payload =>
      this.kontrolNotifikasi.tanganiPesanBaru(payload).catch(err =>
        console.error(new Date().toISOString(), "[NotifikasiSubscriber] tanganiPesanBaru error:", err),
      ));
  }
}
