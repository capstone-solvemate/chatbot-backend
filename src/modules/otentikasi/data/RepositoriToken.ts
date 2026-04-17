import type { RefreshToken } from "../domain/RefreshToken.js";

import { ModelRefreshToken } from "../../../models/ModelRefreshToken.js";
import { refreshTokenToModel } from "./model/converters.js";

export class RepositoriToken {
  private constructor() {}
  static instance = new RepositoriToken();

  async tambahRefreshToken(refreshToken: RefreshToken): Promise<void> {
    const { id, dibuatPada, ...modelRefreshToken } = refreshTokenToModel(refreshToken);
    const dibuatPadaOvd = new Date();
    const hasil = await ModelRefreshToken.create({
      dibuatPada: dibuatPadaOvd,
      ...modelRefreshToken,
    });
    refreshToken.id = (hasil as any).id;
    refreshToken.dibuatPada = dibuatPadaOvd;
  }
}
