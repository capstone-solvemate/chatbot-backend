import type { Request, Response } from "express";

import { ValidationError } from "~/core/types/ValidationError.js";

import type { RepositoriKategori } from "../data/RepositoriKategori.js";

import { kategoriToDto } from "./converters.js";
import { validasiDataKategori } from "./dto/validators.js";

export class KontrolKategori {
  constructor(
    private readonly repositoriKategori: RepositoriKategori,
  ) {}

  async getDaftarKategori(req: Request, res: Response): Promise<void> {
    const daftarKategori = await this.repositoriKategori.getDaftarKategori();
    const daftarKategoriDto = daftarKategori.map(kategori => kategoriToDto(kategori));
    res.send(daftarKategoriDto);
  };

  async tambahKategori(req: Request, res: Response): Promise<void> {
    const dto = validasiDataKategori(req.body);
    const kategori = await this.repositoriKategori.tambahKategori(dto.nama);
    res.status(201).json(kategoriToDto(kategori));
  }

  async editKategori(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      throw new ValidationError([{ field: "id", error: "invalid", message: "id kategori tidak valid." }]);
    }

    const existing = await this.repositoriKategori.getById(id);
    if (!existing) {
      throw new ValidationError([{ field: "id", error: "not_found", message: "kategori tidak ditemukan." }]);
    }

    const dto = validasiDataKategori(req.body);
    await this.repositoriKategori.editKategori(id, dto.nama);
    res.sendStatus(204);
  }

  async hapusKategori(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      throw new ValidationError([{ field: "id", error: "invalid", message: "id kategori tidak valid." }]);
    }

    const existing = await this.repositoriKategori.getById(id);
    if (!existing) {
      throw new ValidationError([{ field: "id", error: "not_found", message: "kategori tidak ditemukan." }]);
    }

    const berhasil = await this.repositoriKategori.hapusKategori(id);
    if (!berhasil) {
      throw new ValidationError([{
        field: "id",
        error: "kategori_digunakan",
        message: "kategori tidak bisa dihapus karena masih digunakan.",
      }]);
    }

    res.sendStatus(204);
  }
}
