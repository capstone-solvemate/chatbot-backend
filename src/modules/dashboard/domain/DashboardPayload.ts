export type HistoryItem = {
  label: string;
  jumlah: number;
};

export type FilterDashboard = {
  tahun: number;
  bulan?: number; // 1–12, opsional
};

/**
 * Payload Admin Dashboard.
 * Granularitas history:
 *   - tahun saja      → per bulan (label: "Jan", "Feb", ...)
 *   - tahun + bulan   → per hari  (label: "1", "2", ..., "31")
 */
export type DashboardPayload = {
  totalTiket: number;
  tiketTerbuka: number;
  deflectionRate: number; // persentase 0–100
  totalSesiChat: number;
  historyTiket: HistoryItem[];
  historySesiChat: HistoryItem[];
  avgAktivitasPerJam: HistoryItem[]; // 24 item, label "00"–"23"
  mostFrequentIssues: null;
  filter: FilterDashboard;
};
