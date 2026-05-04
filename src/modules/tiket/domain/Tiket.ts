import type { StatusTiket } from "./StatusTiket.js";

export class Tiket {
  constructor(
    public id: bigint,
    public judul: string,
    public deskripsi: string,
    public idPembuat: number,
    public idChat: bigint,
    public idKategori: number,
    public status: StatusTiket,
    public dibuatPada: Date,
    public diperbaruiPada: Date,
  ) {}
}
