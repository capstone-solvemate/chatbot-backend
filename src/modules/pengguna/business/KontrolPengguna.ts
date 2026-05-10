import type { Request, Response } from "express";

import { hashSync } from "bcrypt";

import { ValidationError } from "~/core/types/ValidationError.js";

import type { RepositoriPengguna } from "../data/RepositoriPengguna.js";

import { editPenggunaDtoToPengguna, penggunaToDto, tambahPenggunaDtoToPengguna } from "./dto/converters.js";
import { validasiDataEditPengguna, validasiDataGetPengguna, validasiDataTambahPengguna } from "./dto/validators.js";

export class KontrolPengguna {
  constructor(private readonly repositoriPengguna: RepositoriPengguna) {}

  async tambahPengguna(req: Request, res: Response): Promise<void> {
    const reqDto = validasiDataTambahPengguna(req.body);
    const pengguna = tambahPenggunaDtoToPengguna(reqDto);

    pengguna.password = hashSync(pengguna.password, 12);

    await this.repositoriPengguna.tambahPengguna(pengguna);
    res.sendStatus(204);
  }

  async getPengguna(req: Request, res: Response): Promise<void> {
    const reqDto = validasiDataGetPengguna(req.query);
    const pengguna = await this.repositoriPengguna.getPengguna(reqDto.cari || null);
    const resDto = pengguna.map(p => penggunaToDto(p));
    res.status(200).send(resDto);
  }

  async editPengguna(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      throw new ValidationError([{
        field: "id",
        error: "invalid",
        message: "id pengguna tidak valid.",
      }]);
    }

    const reqDto = validasiDataEditPengguna(req.body);

    const existing = await this.repositoriPengguna.getPenggunaById(id);
    if (!existing) {
      throw new ValidationError([{
        field: "id",
        error: "not_found",
        message: "pengguna tidak ditemukan.",
      }]);
    }

    const pengguna = editPenggunaDtoToPengguna(id, reqDto);

    if (reqDto.passwordBaru) {
      pengguna.password = hashSync(reqDto.passwordBaru, 12);
    }

    await this.repositoriPengguna.editPengguna(pengguna);
    res.sendStatus(204);
  }

  async getPenggunaById(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      throw new ValidationError([{
        field: "id",
        error: "invalid",
        message: "id pengguna tidak valid.",
      }]);
    }

    const pengguna = await this.repositoriPengguna.getPenggunaById(id, false, true);
    if (!pengguna) {
      throw new ValidationError([{
        field: "id",
        error: "not_found",
        message: "pengguna tidak ditemukan.",
      }]);
    }

    res.status(200).json(penggunaToDto(pengguna));
  }
}
