export class FaqViewLog {
  constructor(
    public id: bigint,
    public idFaq: number,
    public idPengguna: number | null,
    public dilihatPada: Date,
  ) {}
}
