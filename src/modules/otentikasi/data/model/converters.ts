import { intToPeranPengguna, peranPenggunaToInt } from "../../../pengguna/domain/PeranPengguna.js";
import { ResetPassword } from "../../domain/ResetPassword.js";
import { Session } from "../../domain/Session.js";

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

export function modelToResetPassword(model: any): ResetPassword {
  return new ResetPassword(
    model.id,
    model.email,
    model.otp,
    model.reset_token,
    model.otp_expired_pada ? new Date(model.otp_expired_pada) : null,
    model.reset_token_expired_pada ? new Date(model.reset_token_expired_pada) : null,
    model.percobaan_salah,
    model.jumlah_permintaan,
    model.permintaan_pertama_pada ? new Date(model.permintaan_pertama_pada) : null,
    new Date(model.dibuat_pada),
  );
}
