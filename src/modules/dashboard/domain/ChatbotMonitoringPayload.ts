import type { FilterDashboard, HistoryItem } from "./DashboardPayload.js";

export type ChatbotMonitoringPayload = {
  totalSesi: number;
  totalPesan: number;
  avgPesanPerSesi: number;
  unansweredQuestions: number; // = total tiket dalam filter
  historyAktivitas: HistoryItem[]; // sesi chat per bulan/hari
  avgSesiPerJam: HistoryItem[]; // 24 item, label "00"–"23"
  topUnansweredQuestions: null;
  filter: FilterDashboard;
};
