import type { PeranPengguna } from "./PeranPengguna.js";

export class RefreshToken {
  constructor(
    public id: number,
    public idPengguna: number,
    public peran: PeranPengguna,
    public terakhirDipakai: Date,
    public kadaluarsaPada: Date,
    public dibuatPada: Date,
  ) {}
}
