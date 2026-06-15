import type { ChatbotMonitoringPayload } from "../api/ws/payload/ChatbotMonitoringPayload.js";
import type { FilterChatbotMonitoring } from "../api/ws/payload/FilterChatbotMonitoring.js";
import type { RepositoriChatbotMonitoring } from "../data/RepositoriChatbotMonitoring.js";

export class KontrolChatbotMonitoring {
  constructor(
    private repositoriChatbotMonitoring: RepositoriChatbotMonitoring,
  ) {}

  async buatPayloadChatbot(filter: FilterChatbotMonitoring): Promise<ChatbotMonitoringPayload> {
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
