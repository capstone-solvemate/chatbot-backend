import type { Model, ModelStatic } from "sequelize";

import { Op } from "sequelize";

import type { Notifikasi } from "../domain/Notifikasi.js";

import { NotifikasiTiket } from "../domain/NotifikasiTiket.js";
import { jenisNotifikasiToInt, modelToNotifikasi } from "./converters.js";
import { JenisNotifikasi } from "./JenisNotifikasi.js";

const UKURAN_HALAMAN = 8;

export class RepositoriNotifikasi {
  constructor(private readonly modelNotifikasi: ModelStatic<Model<any, any>>) {}

  async getDaftarNotifikasi(idPengguna: number, sebelumId?: bigint): Promise<{ notifikasi: Notifikasi[]; adaLebihBanyak: boolean }> {
    const where: Record<string, any> = { id_pengguna: idPengguna };

    if (sebelumId !== undefined) {
      where.id = { [Op.lt]: sebelumId };
    }

    const rows = await this.modelNotifikasi.findAll({
      where,
      order: [["id", "DESC"]],
      limit: UKURAN_HALAMAN + 1,
    });

    const adaLebihBanyak = rows.length > UKURAN_HALAMAN;
    const notifikasi = rows
      .slice(0, UKURAN_HALAMAN)
      .map(r => modelToNotifikasi(r.toJSON()));

    return { notifikasi, adaLebihBanyak };
  }

  async getJumlahNotifikasiBelumDibaca(idPengguna: number): Promise<number> {
    return this.modelNotifikasi.count({
      where: {
        id_pengguna: idPengguna,
        dibaca_pada: null,
      },
    });
  }

  async buatNotifikasi(notifikasi: Notifikasi): Promise<void> {
    const type = notifikasi instanceof NotifikasiTiket
      ? jenisNotifikasiToInt(JenisNotifikasi.Tiket)
      : jenisNotifikasiToInt(JenisNotifikasi.Umum);

    const extraData = notifikasi instanceof NotifikasiTiket
      ? JSON.stringify({ idTiket: notifikasi.idTiket.toString() })
      : null;

    await this.modelNotifikasi.create({
      id_pengguna: notifikasi.idPengguna,
      type,
      judul: notifikasi.judul,
      deskripsi: notifikasi.deskripsi,
      extra_data: extraData,
      dibuat_pada: notifikasi.dibuatPada,
      dibaca_pada: null,
    });
  }

  async tandaiDibaca(id: bigint, idPengguna: number): Promise<void> {
    await this.modelNotifikasi.update(
      { dibaca_pada: new Date() },
      {
        where: {
          id,
          id_pengguna: idPengguna,
          dibaca_pada: null,
        },
      },
    );
  }

  async tandaiSemuaDibaca(idPengguna: number): Promise<void> {
    await this.modelNotifikasi.update(
      { dibaca_pada: new Date() },
      {
        where: {
          id_pengguna: idPengguna,
          dibaca_pada: null,
        },
      },
    );
  }
}
