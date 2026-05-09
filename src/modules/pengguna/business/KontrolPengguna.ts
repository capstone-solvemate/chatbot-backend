import type { Request, Response } from "express";

import { hashSync } from "bcrypt";

import type { RepositoriPengguna } from "../data/RepositoriPengguna.js";

import { penggunaToDto, tambahPenggunaDtoToPengguna } from "./dto/converters.js";
import { validasiDataGetPengguna, validasiDataTambahPengguna } from "./dto/validators.js";

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
}
