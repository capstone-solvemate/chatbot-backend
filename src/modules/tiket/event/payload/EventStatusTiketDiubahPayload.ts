import type { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

export type EventStatusTiketDiubahPayload = {
  idTiket: bigint;
  judulTiket: string;
  statusBaru: string;
  idPengirim: number;
  peranPengirim: PeranPengguna;
  idPemilikTiket: number; // karyawan pemilik tiket, selalu ada
};
