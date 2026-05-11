import type { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

export type EventPesanTiketBaruPayload = {
  idTiket: bigint;
  judulTiket: string;
  idPengirim: number;
  peranPengirim: PeranPengguna;
  idPemilikTiket: number; // karyawan pemilik tiket, selalu ada
};
