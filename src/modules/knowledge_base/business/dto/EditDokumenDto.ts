export class EditDokumenDto {
  constructor(
    public judul: string,
    public idKategori: number,
    public file: Express.Multer.File | null,
  ) {}
}
