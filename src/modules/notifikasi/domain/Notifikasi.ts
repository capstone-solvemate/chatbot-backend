export class Notifikasi {
  constructor(
    public id: bigint,
    public idPengguna: number,
    public judul: string,
    public deskripsi: string,
    public dibuatPada: Date,
    public dibacaPada: Date | null,
  ) { }
}
