import { QueryTypes } from "sequelize";

import { DI } from "~/di/DI.js";
import { StatusTiket } from "~/modules/tiket/domain/StatusTiket.js";

import type { FilterDashboard, HistoryItem } from "../domain/DashboardPayload.js";

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export class RepositoriDashboard {
  static readonly instance = new RepositoriDashboard();
  private constructor() {}

  private get sequelize() {
    return DI.provideSequelize();
  }

  async getTotalTiket(): Promise<number> {
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM tiket`,
      { type: QueryTypes.SELECT },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  async getTiketTerbuka(): Promise<number> {
    const rows = await this.sequelize.query<{ jumlah: string }>(
      `SELECT COUNT(*) AS jumlah FROM tiket WHERE status = :status`,
      {
        type: QueryTypes.SELECT,
        replacements: { status: StatusTiket.Open },
      },
    );
    return Number(rows[0]?.jumlah ?? 0);
  }

  /**
   * Query history tiket sesuai filter.
   * Granularitas otomatis ditentukan berdasarkan filter yang aktif.
   */
  async getHistory(filter: FilterDashboard): Promise<HistoryItem[]> {
    if (filter.bulan !== undefined && filter.minggu !== undefined) {
      return this.getHistoryPerHariDalamMinggu(filter.tahun, filter.bulan, filter.minggu);
    }
    if (filter.bulan !== undefined) {
      return this.getHistoryPerHari(filter.tahun, filter.bulan);
    }
    return this.getHistoryPerBulan(filter.tahun);
  }

  /** Filter: tahun saja → per bulan (Jan–Des) */
  private async getHistoryPerBulan(tahun: number): Promise<HistoryItem[]> {
    const rows = await this.sequelize.query<{ bulan: string; jumlah: string }>(
      `SELECT MONTH(dibuat_pada) AS bulan, COUNT(*) AS jumlah
       FROM tiket
       WHERE YEAR(dibuat_pada) = :tahun
       GROUP BY MONTH(dibuat_pada)
       ORDER BY bulan ASC`,
      {
        type: QueryTypes.SELECT,
        replacements: { tahun },
      },
    );

    // Isi semua 12 bulan, bulan tanpa data = 0
    return Array.from({ length: 12 }, (_, i) => {
      const bulanKe = i + 1;
      const row = rows.find(r => Number(r.bulan) === bulanKe);
      return {
        label: NAMA_BULAN[i],
        jumlah: row ? Number(row.jumlah) : 0,
      };
    });
  }

  /** Filter: tahun + bulan → per hari (1–akhir bulan) */
  private async getHistoryPerHari(tahun: number, bulan: number): Promise<HistoryItem[]> {
    const rows = await this.sequelize.query<{ hari: string; jumlah: string }>(
      `SELECT DAY(dibuat_pada) AS hari, COUNT(*) AS jumlah
       FROM tiket
       WHERE YEAR(dibuat_pada) = :tahun AND MONTH(dibuat_pada) = :bulan
       GROUP BY DAY(dibuat_pada)
       ORDER BY hari ASC`,
      {
        type: QueryTypes.SELECT,
        replacements: { tahun, bulan },
      },
    );

    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    return Array.from({ length: jumlahHari }, (_, i) => {
      const hariKe = i + 1;
      const row = rows.find(r => Number(r.hari) === hariKe);
      return {
        label: String(hariKe),
        jumlah: row ? Number(row.jumlah) : 0,
      };
    });
  }

  /**
   * Filter: tahun + bulan + minggu → per hari dalam minggu tersebut (Sen–Min).
   * Minggu ke-N dihitung dari hari pertama bulan tersebut.
   * Contoh: minggu=1 → hari 1 s.d. 7, minggu=2 → hari 8 s.d. 14, dst.
   */
  private async getHistoryPerHariDalamMinggu(
    tahun: number,
    bulan: number,
    minggu: number,
  ): Promise<HistoryItem[]> {
    const hariMulai = (minggu - 1) * 7 + 1;
    const hariSelesai = Math.min(minggu * 7, new Date(tahun, bulan, 0).getDate());

    const rows = await this.sequelize.query<{ hari: string; hari_minggu: string; jumlah: string }>(
      `SELECT DAY(dibuat_pada) AS hari, DAYOFWEEK(dibuat_pada) AS hari_minggu, COUNT(*) AS jumlah
       FROM tiket
       WHERE YEAR(dibuat_pada) = :tahun
         AND MONTH(dibuat_pada) = :bulan
         AND DAY(dibuat_pada) BETWEEN :hariMulai AND :hariSelesai
       GROUP BY DAY(dibuat_pada), DAYOFWEEK(dibuat_pada)
       ORDER BY hari ASC`,
      {
        type: QueryTypes.SELECT,
        replacements: { tahun, bulan, hariMulai, hariSelesai },
      },
    );

    // Buat array hari dalam range minggu ini
    return Array.from({ length: hariSelesai - hariMulai + 1 }, (_, i) => {
      const hariKe = hariMulai + i;
      const row = rows.find(r => Number(r.hari) === hariKe);
      // DAYOFWEEK: 1=Minggu, 2=Senin, ..., 7=Sabtu
      const dayOfWeek = row
        ? Number(row.hari_minggu)
        : new Date(tahun, bulan - 1, hariKe).getDay() + 1;
      return {
        label: NAMA_HARI[dayOfWeek - 1],
        jumlah: row ? Number(row.jumlah) : 0,
      };
    });
  }
}
