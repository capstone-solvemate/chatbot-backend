export class PesanChat {
  constructor(
    public readonly id: bigint,
    public readonly idChat: bigint,
    public readonly pesan: string,
    public readonly tanggalDibuat: Date,
    public readonly chatAsisten: boolean,
  ) {}
}
