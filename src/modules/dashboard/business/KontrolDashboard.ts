import type { RepositoriDashboard } from "../data/RepositoriDashboard.js";
import type { DashboardPayload, FilterDashboard } from "../domain/DashboardPayload.js";

export class KontrolDashboard {
  constructor(
    private readonly repositoriDashboard: RepositoriDashboard,
  ) {}

  async buatPayloadAdmin(filter: FilterDashboard): Promise<DashboardPayload> {
    const [
      totalTiket,
      tiketTerbuka,
      deflectionRate,
      totalSesiChat,
      historyTiket,
      historySesiChat,
      avgAktivitasPerJam,
      mostFrequentIssueCategories,
    ] = await Promise.all([
      this.repositoriDashboard.getTotalTiket(filter),
      this.repositoriDashboard.getTiketTerbuka(filter),
      this.repositoriDashboard.getDeflectionRate(filter),
      this.repositoriDashboard.getTotalSesiChat(filter),
      this.repositoriDashboard.getHistoryTiket(filter),
      this.repositoriDashboard.getHistorySesiChat(filter),
      this.repositoriDashboard.getAvgAktivitasPerJam(filter),
      this.repositoriDashboard.getMostFrequentIssueCategories(filter),
    ]);

    return {
      totalTiket,
      tiketTerbuka,
      deflectionRate,
      totalSesiChat,
      historyTiket,
      historySesiChat,
      avgAktivitasPerJam,
      mostFrequentIssueCategories,
      filter,
    };
  }
}
