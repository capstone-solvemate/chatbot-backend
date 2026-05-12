import type { RepositoriChatbotMonitoring } from "../data/RepositoriChatbotMonitoring.js";
import type { RepositoriDashboard } from "../data/RepositoriDashboard.js";
import type { ChatbotMonitoringPayload } from "../domain/ChatbotMonitoringPayload.js";
import type { DashboardPayload, FilterDashboard } from "../domain/DashboardPayload.js";

export class KontrolDashboard {
  constructor(
    private readonly repositoriDashboard: RepositoriDashboard,
    private readonly repositoriChatbotMonitoring: RepositoriChatbotMonitoring,
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
    ] = await Promise.all([
      this.repositoriDashboard.getTotalTiket(filter),
      this.repositoriDashboard.getTiketTerbuka(filter),
      this.repositoriDashboard.getDeflectionRate(filter),
      this.repositoriDashboard.getTotalSesiChat(filter),
      this.repositoriDashboard.getHistoryTiket(filter),
      this.repositoriDashboard.getHistorySesiChat(filter),
      this.repositoriDashboard.getAvgAktivitasPerJam(filter),
    ]);

    return {
      totalTiket,
      tiketTerbuka,
      deflectionRate,
      totalSesiChat,
      historyTiket,
      historySesiChat,
      avgAktivitasPerJam,
      mostFrequentIssues: null,
      filter,
    };
  }

  async buatPayloadChatbot(filter: FilterDashboard): Promise<ChatbotMonitoringPayload> {
    const [
      totalSesi,
      totalPesan,
      unansweredQuestions,
      historyAktivitas,
      avgSesiPerJam,
    ] = await Promise.all([
      this.repositoriChatbotMonitoring.getTotalSesi(filter),
      this.repositoriChatbotMonitoring.getTotalPesan(filter),
      this.repositoriChatbotMonitoring.getUnansweredQuestions(filter),
      this.repositoriChatbotMonitoring.getHistoryAktivitas(filter),
      this.repositoriChatbotMonitoring.getAvgSesiPerJam(filter),
    ]);

    const avgPesanPerSesi = totalSesi === 0 ? 0 : Math.round((totalPesan / totalSesi) * 10) / 10;

    return {
      totalSesi,
      totalPesan,
      avgPesanPerSesi,
      unansweredQuestions,
      historyAktivitas,
      avgSesiPerJam,
      topUnansweredQuestions: null,
      filter,
    };
  }
}
