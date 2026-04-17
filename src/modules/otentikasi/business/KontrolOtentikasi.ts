import type { Request, Response } from "express";

import * as bcrypt from "bcrypt";

import { UnauthenticatedError, UnauthenticatedReason } from "../../../core/types/UnauthenticatedError.js";
import { RepositoriPengguna } from "../data/RepositoriPengguna.js";
import { RepositoriToken } from "../data/RepositoriToken.js";
import { REFRESH_TOKEN_TIMEOUT } from "../domain/constants.js";
import { PeranPengguna } from "../domain/PeranPengguna.js";
import { RefreshToken } from "../domain/RefreshToken.js";
import { AuthTokenService } from "./AuthTokenService.js";
import { validasiLogin } from "./validators.js";

export class KontrolOtentikasi {
  private constructor() {}
  static readonly instance = new KontrolOtentikasi();

  private readonly repositoriPengguna = RepositoriPengguna.instance;
  private readonly authTokenService = AuthTokenService.instance;
  private readonly repositoriToken = RepositoriToken.instance;

  async loginKaryawan(req: Request, res: Response) {
    const loginDto = validasiLogin(req);
    const pengguna = await this.repositoriPengguna.getPenggunaByEmail(loginDto.email);
    if (!pengguna) {
      throw new UnauthenticatedError(UnauthenticatedReason.UserNotFound, loginDto.email);
    }
    if (!await bcrypt.compare(loginDto.password, pengguna.password)) {
      throw new UnauthenticatedError(UnauthenticatedReason.InvalidPassword, loginDto.email);
    }

    // TODO: Cek peran pengguna

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setSeconds(refreshTokenExpiresAt.getSeconds() + REFRESH_TOKEN_TIMEOUT);
    const refreshTokenObj = new RefreshToken(
      0,
      pengguna.id,
      PeranPengguna.Karyawan,
      new Date(),
      refreshTokenExpiresAt,
      new Date(),
    );
    await this.repositoriToken.tambahRefreshToken(refreshTokenObj);

    const accessToken = this.authTokenService.createAccessToken(
      pengguna.id,
      PeranPengguna.Karyawan,
    );

    const refreshToken = this.authTokenService.createRefreshToken(
      refreshTokenObj.id,
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/api",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/auth/refresh-token",
    });
    res.sendStatus(204);
  }
}
