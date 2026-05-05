import type { DashboardPayload, FilterDashboard } from "../domain/DashboardPayload.js";

import { RepositoriDashboard } from "../data/RepositoriDashboard.js";

export class KontrolDashboard {
  static readonly instance = new KontrolDashboard();
  private constructor() {}

  private readonly repositori = RepositoriDashboard.instance;

  /**
   * Bangun payload dashboard lengkap untuk dikirim ke klien.
   * Dipanggil saat koneksi WS pertama kali dibuka, dan setiap kali
   * ada event "tiket:dibuat" dari DashboardEventBus.
   */
  async buatPayload(filter: FilterDashboard): Promise<DashboardPayload> {
    const [totalTiket, tiketTerbuka, history] = await Promise.all([
      this.repositori.getTotalTiket(),
      this.repositori.getTiketTerbuka(),
      this.repositori.getHistory(filter),
    ]);

    return {
      totalTiket,
      tiketTerbuka,
      history,
      filter,
    };
  }
}
