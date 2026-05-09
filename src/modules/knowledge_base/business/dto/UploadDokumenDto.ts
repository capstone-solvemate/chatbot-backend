export class UploadDokumenDto {
  constructor(
    public judul: string,
    public idKategori: number,
    public file: Express.Multer.File,
  ) {}
}
