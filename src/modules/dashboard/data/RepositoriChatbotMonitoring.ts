import type { Sequelize } from "sequelize";

import { QueryTypes } from "sequelize";

import type { FilterDashboard, HistoryItem } from "../domain/DashboardPayload.js";

const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export class RepositoriChatbotMonitoring {
  constructor(private readonly sequelize: Sequelize) {}

  async getTotalSesi(filter: FilterDashboard): Promise<number> {
    const { where, replacements } = this.buildChatWhere(filter);
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM chat ${where}`,
      { type: QueryTypes.SELECT, replacements },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getTotalPesan(filter: FilterDashboard): Promise<number> {
    const { where, replacements } = this.buildPesanChatWhere(filter);
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM pesan_chat ${where}`,
      { type: QueryTypes.SELECT, replacements },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getUnansweredQuestions(filter: FilterDashboard): Promise<number> {
    const { where, replacements } = this.buildTiketWhere(filter);
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM tiket ${where}`,
      { type: QueryTypes.SELECT, replacements },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getHistoryAktivitas(filter: FilterDashboard): Promise<HistoryItem[]> {
    if (filter.bulan !== undefined) {
      return this.getHistoryPerHari(filter.tahun, filter.bulan);
    }
    return this.getHistoryPerBulan(filter.tahun);
  }

  private async getHistoryPerBulan(tahun: number): Promise<HistoryItem[]> {
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

  private async getHistoryPerHari(tahun: number, bulan: number): Promise<HistoryItem[]> {
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

  async getAvgSesiPerJam(filter: FilterDashboard): Promise<HistoryItem[]> {
    const { where, replacements } = this.buildChatWhere(filter);
    const rows = await this.sequelize.query<{ jam: string; jumlah: string }>(
      `SELECT HOUR(tanggal_dibuat) AS jam, COUNT(*) AS jumlah
       FROM chat ${where}
       GROUP BY HOUR(tanggal_dibuat)`,
      { type: QueryTypes.SELECT, replacements },
    );
    return Array.from({ length: 24 }, (_, i) => {
      const row = rows.find(r => Number(r.jam) === i);
      return {
        label: String(i).padStart(2, "0"),
        jumlah: row ? Number(row.jumlah) : 0,
      };
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private buildChatWhere(filter: FilterDashboard): { where: string; replacements: Record<string, any> } {
    const replacements: Record<string, any> = { tahun: filter.tahun };
    let where = "WHERE YEAR(tanggal_dibuat) = :tahun";
    if (filter.bulan !== undefined) {
      where += " AND MONTH(tanggal_dibuat) = :bulan";
      replacements.bulan = filter.bulan;
    }
    return { where, replacements };
  }

  private buildPesanChatWhere(filter: FilterDashboard): { where: string; replacements: Record<string, any> } {
    const replacements: Record<string, any> = { tahun: filter.tahun };
    let where = "WHERE YEAR(tanggal_dibuat) = :tahun";
    if (filter.bulan !== undefined) {
      where += " AND MONTH(tanggal_dibuat) = :bulan";
      replacements.bulan = filter.bulan;
    }
    return { where, replacements };
  }

  private buildTiketWhere(filter: FilterDashboard): { where: string; replacements: Record<string, any> } {
    const replacements: Record<string, any> = { tahun: filter.tahun };
    let where = "WHERE YEAR(dibuat_pada) = :tahun";
    if (filter.bulan !== undefined) {
      where += " AND MONTH(dibuat_pada) = :bulan";
      replacements.bulan = filter.bulan;
    }
    return { where, replacements };
  }
}
