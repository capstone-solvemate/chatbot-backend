import * as jwt from "jsonwebtoken";
import * as uuid from "uuid";

import type { PeranPengguna } from "../domain/PeranPengguna.js";

import { UnauthenticatedError, UnauthenticatedReason } from "../../../core/types/UnauthenticatedError.js";
import { ACCESS_TOKEN_TIMEOUT, REFRESH_TOKEN_TIMEOUT } from "../domain/constants.js";
import { peranPenggunaToString, stringToPeranPengguna } from "../domain/PeranPengguna.js";

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

  verifikasiAccessToken(token: string): [string, number, PeranPengguna | null] {
    try {
      const { jti, peran: peranStr, sub }: { jti: string; peran: string; sub: string } = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!jti && !jti.startsWith("a-")) {
        throw new UnauthenticatedError(UnauthenticatedReason.InvalidToken);
      }
      const accessTokenId = jti.slice(2);
      const idPengguna = Number.parseInt(sub);
      if (Number.isNaN(idPengguna)) {
        throw new UnauthenticatedError(UnauthenticatedReason.InvalidToken);
      }
      const peran = stringToPeranPengguna(peranStr);
      return [accessTokenId, idPengguna, peran];
    }
    catch (e: any) {
      if (e instanceof jwt.JsonWebTokenError) {
        throw new UnauthenticatedError(UnauthenticatedReason.InvalidToken);
      }
      else {
        throw e;
      }
    }
  }
}
