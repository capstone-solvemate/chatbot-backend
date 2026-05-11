import type { Notifikasi } from "../domain/Notifikasi.js";

import { jenisNotifikasiToInt } from "../data/converters.js";
import { JenisNotifikasi } from "../data/JenisNotifikasi.js";
import { NotifikasiTiket } from "../domain/NotifikasiTiket.js";

export function notifikasiToDto(notifikasi: Notifikasi): Record<string, any> {
  const jenis = notifikasi instanceof NotifikasiTiket
    ? JenisNotifikasi.Tiket
    : JenisNotifikasi.Umum;

  let extraData: Record<string, any> | null = null;
  if (notifikasi instanceof NotifikasiTiket) {
    extraData = {
      idTiket: notifikasi.idTiket.toString(),
    };
  }

  return {
    id: notifikasi.id.toString(),
    idPengguna: notifikasi.idPengguna,
    type: jenisNotifikasiToInt(jenis),
    judul: notifikasi.judul,
    deskripsi: notifikasi.deskripsi,
    dibuatPada: notifikasi.dibuatPada.toISOString(),
    dibacaPada: notifikasi.dibacaPada?.toISOString() || null,
    extraData,
  };
}
