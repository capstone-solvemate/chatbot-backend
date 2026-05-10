export class Faq {
  constructor(
    public id: number,
    public idKategori: number,
    public question: string,
    public answer: string,
    public jumlahDilihat: number = 0,
    public jumlahHelpful: number = 0,
  ) {}
}
