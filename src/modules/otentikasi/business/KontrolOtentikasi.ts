import type { Request, Response } from "express";

import * as bcrypt from "bcrypt";
import * as uuid from "uuid";

import { InvalidCsrfToken } from "~/core/types/InvalidCsrfTokenError.js";

import type { InfoPenggunaDto } from "./InfoPenggunaDto.js";

import { UnauthenticatedError, UnauthenticatedReason } from "../../../core/types/UnauthenticatedError.js";
import { RepositoriPengguna } from "../data/RepositoriPengguna.js";
import { CSRF_TOKEN_COOKIE_KEY, SESSION_COOKIE_KEY } from "../domain/constants.js";
import { PeranPengguna, peranPenggunaToString } from "../domain/PeranPengguna.js";
import { Session } from "../domain/Session.js";
import { RepositoriSession } from "./RepositoriSession.js";
import { validasiLogin } from "./validators.js";

export class KontrolOtentikasi {
  private constructor() {}
  static readonly instance = new KontrolOtentikasi();

  private readonly repositoriPengguna = RepositoriPengguna.instance;
  private readonly repositoriSession = RepositoriSession.instance;

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

    await this.repositoriSession.updatePenggunaTerotentikasi(req.sesiPengguna!.sessionId, {
      idPengguna: pengguna.id,
      peran: PeranPengguna.Karyawan,
    });

    res.sendStatus(204);
  }

  async getInfoPengguna(req: Request, res: Response): Promise<void> {
    const pengguna = await this.repositoriPengguna.getPenggunaById(req.sesiPengguna!.idPengguna!);
    if (pengguna === null) {
      throw new UnauthenticatedError(
        UnauthenticatedReason.UserNotFound,
        undefined,
        req.sesiPengguna!.idPengguna!,
      );
    }
    const resp: InfoPenggunaDto = {
      id: pengguna.id,
      nama: pengguna.nama,
      peran: peranPenggunaToString(req.sesiPengguna!.peranPengguna!),
    };
    res.json(resp);
  }

  async tanganiSessionTidakValid(req: Request, res: Response): Promise<void> {
    const session = new Session(
      "",
      null,
      null,
      uuid.v4().toString(),
      req.headers["user-agent"] || null,
      new Date(),
    );
    await this.repositoriSession.buatSession(session);

    res.cookie(SESSION_COOKIE_KEY, session.id, {
      httpOnly: true,
      path: "/api",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie(CSRF_TOKEN_COOKIE_KEY, session.csrfToken, {
      httpOnly: false,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    throw new InvalidCsrfToken();
  }

  tanganiCsrfTidakValid(req: Request, res: Response): void {
    res.cookie(CSRF_TOKEN_COOKIE_KEY, req.sesiPengguna!.csrfToken, {
      httpOnly: false,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    throw new InvalidCsrfToken();
  }
}
