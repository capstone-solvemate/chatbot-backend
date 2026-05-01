export class Chat {
  constructor(
    public readonly id: bigint,
    public readonly idPembuat: number,
    public readonly tanggalDibuat: Date,
    public readonly subjek: string,
  ) {}
}
