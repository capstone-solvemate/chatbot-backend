import { Pengguna } from "../../domain/Pengguna.js";

export function modelToPengguna(model: any): Pengguna {
  return new Pengguna(
    model.id,
    model.nama,
    model.email,
    model.password,
  );
}
