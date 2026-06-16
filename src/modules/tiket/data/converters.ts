import type { Model } from "sequelize";

import { PesanTiket } from "../domain/PesanTiket.js";
import { intToStatusTiket } from "../domain/StatusTiket.js";
import { Tiket } from "../domain/Tiket.js";

export function rowToTiket(model: Model): Tiket {
  const d = model.dataValues;
  return new Tiket(
    BigInt(d.id),
    d.judul,
    d.deskripsi,
    d.id_pembuat,
    BigInt(d.id_chat),
    d.id_kategori,
    intToStatusTiket(d.status)!,
    new Date(d.dibuat_pada),
    new Date(d.diperbarui_pada),
  );
}

export function modelToPesanTiket(model: Model): PesanTiket {
  const d = model.dataValues;
  return new PesanTiket(
    BigInt(d.id),
    BigInt(d.id_tiket),
    d.id_pembuat,
    d.pesan,
    new Date(d.dibuat_pada),
  );
}
