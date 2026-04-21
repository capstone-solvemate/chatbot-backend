import type { RefreshToken } from "../../domain/RefreshToken.js";

import { Pengguna } from "../../domain/Pengguna.js";

export function modelToPengguna(model: any): Pengguna {
  return new Pengguna(
    model.id,
    model.nama,
    model.email,
    model.password,
    [],
  );
}

export function refreshTokenToModel(refreshToken: RefreshToken): Record<string, any> {
  return JSON.parse(JSON.stringify(refreshToken));
}
