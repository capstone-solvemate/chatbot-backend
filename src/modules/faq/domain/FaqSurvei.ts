export class FaqSurvei {
  constructor(
    public idFaq: number,
    public idPengguna: number,
    public jawaban: boolean, // true = ya (helpful), false = tidak
    public dijawabPada: Date,
  ) {}
}
