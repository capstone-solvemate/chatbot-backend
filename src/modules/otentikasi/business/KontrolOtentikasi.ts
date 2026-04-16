import type { Request, Response } from "express";

import * as bcrypt from "bcrypt";

import { UnauthenticatedError, UnauthenticatedReason } from "../../../core/types/UnauthenticatedError.js";
import { RepositoriPengguna } from "../data/RepositoriPengguna.js";
import { validasiLogin } from "./validators.js";

export class KontrolOtentikasi {
  private constructor() {}
  static readonly instance = new KontrolOtentikasi();

  private readonly repositoriPengguna = RepositoriPengguna.instance;

  async loginKaryawan(req: Request, res: Response) {
    const loginDto = validasiLogin(req);
    const pengguna = await this.repositoriPengguna.getPenggunaByEmail(loginDto.email);
    if (!pengguna) {
      throw new UnauthenticatedError(UnauthenticatedReason.UserNotFound, loginDto.email);
    }
    if (!await bcrypt.compare(loginDto.password, pengguna.password)) {
      throw new UnauthenticatedError(UnauthenticatedReason.InvalidPassword, loginDto.email);
    }
    res.sendStatus(204);
  }
}
