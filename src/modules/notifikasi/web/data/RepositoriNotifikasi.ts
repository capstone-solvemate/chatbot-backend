import { ModelNotifikasi } from "~/models/ModelNotifikasi.js";

import type { Notifikasi } from "../domain/Notifikasi.js";

import { modelToNotifikasi } from "./converters.js";

export class RepositoriNotifikasi {
  static readonly instance = new RepositoriNotifikasi();
  private constructor() {}

  async getDaftarNotifikasi(idPengguna: number): Promise<Notifikasi[]> {
    const daftarModelNotifikasi = await ModelNotifikasi.findAll({
      where: {
        id_pengguna: idPengguna,
      },
      order: [
        ["dibuat_pada", "DESC"],
      ],
    });
    const daftarNotifikasi = daftarModelNotifikasi.map(modelNotifikasi => modelToNotifikasi(modelNotifikasi));
    return daftarNotifikasi;
  }

  async getJumlahNotifikasiBelumDibaca(idPengguna: number): Promise<number> {
    const jumlahBelumDibaca = await ModelNotifikasi.count({
      where: {
        id_pengguna: idPengguna,
        dibaca_pada: null,
      },
    });
    return jumlahBelumDibaca;
  }
}
