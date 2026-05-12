import type { Sequelize } from "sequelize";

import { QueryTypes } from "sequelize";

import { StatusTiket } from "~/modules/tiket/domain/StatusTiket.js";

import type { FilterDashboard, HistoryItem } from "../domain/DashboardPayload.js";

const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export class RepositoriDashboard {
  constructor(private readonly sequelize: Sequelize) {}

  // ─── Tiket ────────────────────────────────────────────────────────────────

  async getTotalTiket(filter: FilterDashboard): Promise<number> {
    const { where, replacements } = this.buildTiketWhere(filter);
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM tiket ${where}`,
      { type: QueryTypes.SELECT, replacements },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getTiketTerbuka(filter: FilterDashboard): Promise<number> {
    const { where, replacements } = this.buildTiketWhere(filter);
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM tiket ${where}
       ${where ? "AND" : "WHERE"} status = :status`,
      { type: QueryTypes.SELECT, replacements: { ...replacements, status: StatusTiket.Open } },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getHistoryTiket(filter: FilterDashboard): Promise<HistoryItem[]> {
    if (filter.bulan !== undefined) {
      return this.getHistoryTiketPerHari(filter.tahun, filter.bulan);
    }
    return this.getHistoryTiketPerBulan(filter.tahun);
  }

  private async getHistoryTiketPerBulan(tahun: number): Promise<HistoryItem[]> {
    const rows = await this.sequelize.query<{ bulan: string; jumlah: string }>(
      `SELECT MONTH(dibuat_pada) AS bulan, COUNT(*) AS jumlah
       FROM tiket
       WHERE YEAR(dibuat_pada) = :tahun
       GROUP BY MONTH(dibuat_pada)
       ORDER BY bulan ASC`,
      { type: QueryTypes.SELECT, replacements: { tahun } },
    );
    return Array.from({ length: 12 }, (_, i) => {
      const row = rows.find(r => Number(r.bulan) === i + 1);
      return { label: NAMA_BULAN[i], jumlah: row ? Number(row.jumlah) : 0 };
    });
  }

  private async getHistoryTiketPerHari(tahun: number, bulan: number): Promise<HistoryItem[]> {
    const rows = await this.sequelize.query<{ hari: string; jumlah: string }>(
      `SELECT DAY(dibuat_pada) AS hari, COUNT(*) AS jumlah
       FROM tiket
       WHERE YEAR(dibuat_pada) = :tahun AND MONTH(dibuat_pada) = :bulan
       GROUP BY DAY(dibuat_pada)
       ORDER BY hari ASC`,
      { type: QueryTypes.SELECT, replacements: { tahun, bulan } },
    );
    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    return Array.from({ length: jumlahHari }, (_, i) => {
      const row = rows.find(r => Number(r.hari) === i + 1);
      return { label: String(i + 1), jumlah: row ? Number(row.jumlah) : 0 };
    });
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────

  async getTotalSesiChat(filter: FilterDashboard): Promise<number> {
    const { where, replacements } = this.buildChatWhere(filter);
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM chat ${where}`,
      { type: QueryTypes.SELECT, replacements },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getHistorySesiChat(filter: FilterDashboard): Promise<HistoryItem[]> {
    if (filter.bulan !== undefined) {
      return this.getHistorySesiChatPerHari(filter.tahun, filter.bulan);
    }
    return this.getHistorySesiChatPerBulan(filter.tahun);
  }

  private async getHistorySesiChatPerBulan(tahun: number): Promise<HistoryItem[]> {
    const rows = await this.sequelize.query<{ bulan: string; jumlah: string }>(
      `SELECT MONTH(tanggal_dibuat) AS bulan, COUNT(*) AS jumlah
       FROM chat
       WHERE YEAR(tanggal_dibuat) = :tahun
       GROUP BY MONTH(tanggal_dibuat)
       ORDER BY bulan ASC`,
      { type: QueryTypes.SELECT, replacements: { tahun } },
    );
    return Array.from({ length: 12 }, (_, i) => {
      const row = rows.find(r => Number(r.bulan) === i + 1);
      return { label: NAMA_BULAN[i], jumlah: row ? Number(row.jumlah) : 0 };
    });
  }

  private async getHistorySesiChatPerHari(tahun: number, bulan: number): Promise<HistoryItem[]> {
    const rows = await this.sequelize.query<{ hari: string; jumlah: string }>(
      `SELECT DAY(tanggal_dibuat) AS hari, COUNT(*) AS jumlah
       FROM chat
       WHERE YEAR(tanggal_dibuat) = :tahun AND MONTH(tanggal_dibuat) = :bulan
       GROUP BY DAY(tanggal_dibuat)
       ORDER BY hari ASC`,
      { type: QueryTypes.SELECT, replacements: { tahun, bulan } },
    );
    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    return Array.from({ length: jumlahHari }, (_, i) => {
      const row = rows.find(r => Number(r.hari) === i + 1);
      return { label: String(i + 1), jumlah: row ? Number(row.jumlah) : 0 };
    });
  }

  // ─── Cross ────────────────────────────────────────────────────────────────

  async getDeflectionRate(filter: FilterDashboard): Promise<number> {
    const [totalChat, totalTiket] = await Promise.all([
      this.getTotalSesiChat(filter),
      this.getTotalTiket(filter),
    ]);
    if (totalChat === 0)
      return 100;
    return Math.round((1 - totalTiket / totalChat) * 100);
  }

  async getAvgAktivitasPerJam(filter: FilterDashboard): Promise<HistoryItem[]> {
    const { where: whereTiket, replacements: repTiket } = this.buildTiketWhere(filter);
    const { where: whereChat, replacements: repChat } = this.buildChatWhere(filter);

    const [rowsTiket, rowsChat] = await Promise.all([
      this.sequelize.query<{ jam: string; jumlah: string }>(
        `SELECT HOUR(dibuat_pada) AS jam, COUNT(*) AS jumlah
         FROM tiket ${whereTiket}
         GROUP BY HOUR(dibuat_pada)`,
        { type: QueryTypes.SELECT, replacements: repTiket },
      ),
      this.sequelize.query<{ jam: string; jumlah: string }>(
        `SELECT HOUR(tanggal_dibuat) AS jam, COUNT(*) AS jumlah
         FROM chat ${whereChat}
         GROUP BY HOUR(tanggal_dibuat)`,
        { type: QueryTypes.SELECT, replacements: repChat },
      ),
    ]);

    return Array.from({ length: 24 }, (_, i) => {
      const tiket = rowsTiket.find(r => Number(r.jam) === i);
      const chat = rowsChat.find(r => Number(r.jam) === i);
      return {
        label: String(i).padStart(2, "0"),
        jumlah: (tiket ? Number(tiket.jumlah) : 0) + (chat ? Number(chat.jumlah) : 0),
      };
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private buildTiketWhere(filter: FilterDashboard): { where: string; replacements: Record<string, any> } {
    const replacements: Record<string, any> = { tahun: filter.tahun };
    let where = "WHERE YEAR(dibuat_pada) = :tahun";
    if (filter.bulan !== undefined) {
      where += " AND MONTH(dibuat_pada) = :bulan";
      replacements.bulan = filter.bulan;
    }
    return { where, replacements };
  }

  private buildChatWhere(filter: FilterDashboard): { where: string; replacements: Record<string, any> } {
    const replacements: Record<string, any> = { tahun: filter.tahun };
    let where = "WHERE YEAR(tanggal_dibuat) = :tahun";
    if (filter.bulan !== undefined) {
      where += " AND MONTH(tanggal_dibuat) = :bulan";
      replacements.bulan = filter.bulan;
    }
    return { where, replacements };
  }
}
