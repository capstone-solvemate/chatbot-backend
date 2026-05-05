export type HistoryItem = {
  label: string;
  jumlah: number;
};

export type FilterDashboard = {
  tahun: number;
  bulan?: number; // 1–12, opsional
  minggu?: number; // 1–5 (minggu ke-N dalam bulan), opsional, hanya jika bulan aktif
};

/**
 * Payload utama yang di-push ke klien WebSocket setiap kali ada update.
 * Granularitas history:
 *   - tahun saja        → per bulan  (label: "Jan", "Feb", ...)
 *   - tahun + bulan     → per hari   (label: "1", "2", ..., "31")
 *   - tahun + bulan + minggu → per hari dalam minggu (label: "Sen", "Sel", ..., "Min")
 */
export type DashboardPayload = {
  totalTiket: number;
  tiketTerbuka: number;
  history: HistoryItem[];
  filter: FilterDashboard;
};
