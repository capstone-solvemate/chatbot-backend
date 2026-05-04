export class BuatTiketDto {
  constructor(
    public judul: string,
    public deskripsi: string,
    public idChat: bigint,
    public idKategori: number,
  ) {}
}
