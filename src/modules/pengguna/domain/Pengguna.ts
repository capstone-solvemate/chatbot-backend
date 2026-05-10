import type { PeranPengguna } from "./PeranPengguna.js";

export class Pengguna {
  constructor(
    public id: number,
    public nama: string,
    public email: string,
    public password: string,
    public peran: PeranPengguna[],
    public isActive: boolean,
  ) {}
}
