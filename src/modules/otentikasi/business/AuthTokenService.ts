import * as jwt from "jsonwebtoken";
import * as uuid from "uuid";

import type { PeranPengguna } from "../domain/PeranPengguna.js";

import { ACCESS_TOKEN_TIMEOUT, REFRESH_TOKEN_TIMEOUT } from "../domain/constants.js";
import { peranPenggunaToString } from "../domain/PeranPengguna.js";

export class AuthTokenService {
  private constructor() {}
  static instance = new AuthTokenService();

  private generateTokenId(): string {
    return uuid.v4().toString();
  }

  createAccessToken(idPengguna: number, peran: PeranPengguna): string {
    return jwt.sign({
      peran: peranPenggunaToString(peran),
    }, process.env.JWT_SECRET!, {
      jwtid: `a-${this.generateTokenId()}`,
      subject: idPengguna.toString(),
      expiresIn: `${ACCESS_TOKEN_TIMEOUT}s`,
    });
  }

  createRefreshToken(idToken: number): string {
    return jwt.sign({}, process.env.JWT_SECRET!, {
      jwtid: `r-${this.generateTokenId()}`,
      subject: idToken.toString(),
      expiresIn: `${REFRESH_TOKEN_TIMEOUT}`,
    });
  }
}
