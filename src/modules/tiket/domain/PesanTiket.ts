export class PesanTiket {
  constructor(
    public id: bigint,
    public idTiket: bigint,
    public idPembuat: number,
    public pesan: string,
    public dibuatPada: Date,
  ) {}
}
