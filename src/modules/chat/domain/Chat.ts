export class Chat {
  constructor(
    public readonly id: bigint,
    public readonly idPembuat: number,
    public readonly tanggalDibuat: Date,
    public readonly subjek: string,
    public readonly sedangDiproses: boolean,
    public readonly dialihkanKeTiket: boolean,
  ) {}
}
