import type { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import type { StatusTiket } from "../../domain/StatusTiket.js";

export type EventStatusTiketDiubahPayload = {
  idTiket: bigint;
  judulTiket: string;
  statusBaru: StatusTiket;
  idPengirim: number;
  peranPengirim: PeranPengguna;
  idPemilikTiket: number; // karyawan pemilik tiket, selalu ada
  nomorTiket: bigint;
};
