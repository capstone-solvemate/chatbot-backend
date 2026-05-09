import { Notifikasi } from "./Notifikasi.js";

export class NotifikasiTiket extends Notifikasi {
  constructor(
    id: bigint,
    idPengguna: number,
    judul: string,
    deskripsi: string,
    dibuatPada: Date,
    dibacaPada: Date | null,
    public idTiket: bigint,
  ) {
    super(
      id,
      idPengguna,
      judul,
      deskripsi,
      dibuatPada,
      dibacaPada,
    );
  }
}
