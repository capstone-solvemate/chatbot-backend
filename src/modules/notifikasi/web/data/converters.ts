import { Notifikasi } from "../domain/Notifikasi.js";
import { NotifikasiTiket } from "../domain/NotifikasiTiket.js";
import { JenisNotifikasi } from "./JenisNotifikasi.js";

export function modelToNotifikasi(model: Record<string, any>): Notifikasi {
  const jenis = intToJenisNotifikasi(model.type);

  if (jenis === JenisNotifikasi.Tiket) {
    const extraData = model.extra_data ? JSON.parse(model.extra_data) : {};
    return new NotifikasiTiket(
      model.id,
      model.id_pengguna,
      model.judul,
      model.deskripsi,
      model.dibuat_pada,
      model.dibaca_pada,
      BigInt(extraData.idTiket ?? 0),
    );
  }

  return new Notifikasi(
    model.id,
    model.id_pengguna,
    model.judul,
    model.deskripsi,
    model.dibuat_pada,
    model.dibaca_pada,
  );
}

export function jenisNotifikasiToInt(jenisNotifikasi: JenisNotifikasi): number {
  switch (jenisNotifikasi) {
    case JenisNotifikasi.Umum:
      return 1;
    case JenisNotifikasi.Tiket:
      return 2;
  }
}

export function intToJenisNotifikasi(data: number): JenisNotifikasi {
  switch (data) {
    case 2:
      return JenisNotifikasi.Tiket;
    default:
      return JenisNotifikasi.Umum;
  }
}
