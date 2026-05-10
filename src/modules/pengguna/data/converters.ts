import type { RowPengguna } from "./RowPengguna.js";
import type { RowPeranPengguna } from "./RowPeranPengguna.js";

import { Pengguna } from "../domain/Pengguna.js";
import { intToPeranPengguna, PeranPengguna, peranPenggunaToInt } from "../domain/PeranPengguna.js";

export function penggunaToRow(pengguna: Pengguna): RowPengguna {
  return {
    id: pengguna.id,
    nama: pengguna.nama,
    email: pengguna.email,
    password: pengguna.password,
  };
}

export function penggunaToRowPeran(pengguna: Pengguna): RowPeranPengguna[] {
  return pengguna.peran.map(peran => ({
    id_pengguna: pengguna.id,
    peran: peranPenggunaToInt(peran),
  }));
}

export function modelToPengguna(model: any): Pengguna {
  let peran: PeranPengguna[] = [];

  if (model.ModelPeranPengguna) {
    peran = (model.ModelPeranPengguna as any[]).map(modelPeran => (intToPeranPengguna(modelPeran.peran) || PeranPengguna.Karyawan));
  }

  return new Pengguna(
    model.id,
    model.nama,
    model.email,
    model.password,
    peran,
    model.isActive,
  );
}
