import type { PeranPengguna } from "../../modules/pengguna/domain/PeranPengguna.js";

export type SesiPengguna = {
  sessionId: string;
  csrfToken: string;
  idPengguna: number | null;
  peranPengguna: PeranPengguna | null;
};
