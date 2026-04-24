import type { PeranPengguna } from "./PeranPengguna.js";

export class Session {
  constructor(
    public id: string,
    public idPengguna: number | null,
    public peranPengguna: PeranPengguna | null,
    public csrfToken: string,
    public userAgent: string | null,
    public aktivitasTerakhirPada: Date,
  ) {}
}
