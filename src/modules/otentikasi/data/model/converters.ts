import type { RefreshToken } from "../../domain/RefreshToken.js";

import { Pengguna } from "../../domain/Pengguna.js";
import { intToPeranPengguna, peranPenggunaToInt } from "../../domain/PeranPengguna.js";
import { Session } from "../../domain/Session.js";

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

export function sessionToModel(session: Session): Record<string, any> {
  return {
    id: session.id,
    id_pengguna: session.idPengguna,
    peran_pengguna: session.peranPengguna ? peranPenggunaToInt(session.peranPengguna) : null,
    csrf_token: session.csrfToken,
    user_agent: session.userAgent,
    aktivitas_terakhir_pada: session.aktivitasTerakhirPada,
  };
}

export function modelToSession(model: any): Session {
  return new Session(
    model.id,
    model.id_pengguna,
    model.peran_pengguna ? intToPeranPengguna(model.peran_pengguna) : null,
    model.csrf_token,
    model.user_agent,
    model.aktivitas_terakhir_pada,
  );
}
