import type { Request, Response } from "express";

import { RepositoriKategori } from "../data/RepositoriKategori.js";
import { kategoriToDto } from "./converters.js";

export class KontrolKategori {
  static readonly instance = new KontrolKategori();
  private constructor() {}

  private readonly repositoriKategori = RepositoriKategori.instance;

  async getDaftarKategori(req: Request, res: Response): Promise<void> {
    const daftarKategori = await this.repositoriKategori.getDaftarKategori();
    const daftarKategoriDto = daftarKategori.map(kategori => kategoriToDto(kategori));
    res.send(daftarKategoriDto);
  };
}
