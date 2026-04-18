import type { PeranPengguna } from "../../modules/otentikasi/domain/PeranPengguna.js";

export type SesiPengguna = {
  accessTokenId: string;
  idPengguna: number;
  peran: PeranPengguna | null;
};
