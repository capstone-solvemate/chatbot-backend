import type { Notifikasi } from "../domain/Notifikasi.js";

import { jenisNotifikasiToInt } from "../data/converters.js";
import { JenisNotifikasi } from "../data/JenisNotifikasi.js";

export function notifikasiToDto(notifikasi: Notifikasi): Record<string, any> {
  return {
    id: notifikasi.id.toString(),
    idPengguna: notifikasi.idPengguna,
    type: jenisNotifikasiToInt(JenisNotifikasi.Umum),
    judul: notifikasi.judul,
    deskripsi: notifikasi.deskripsi,
    dibuatPada: notifikasi.dibuatPada.toISOString(),
    dibacaPada: notifikasi.dibacaPada?.toISOString() || null,
  };
}
