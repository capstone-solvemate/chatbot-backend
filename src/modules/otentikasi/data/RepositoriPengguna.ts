import { ModelPeranPengguna } from "~/models/ModelPeranPengguna.js";

import type { Pengguna } from "../domain/Pengguna.js";

import { ModelPengguna } from "../../../models/ModelPengguna.js";
import { intToPeranPengguna } from "../domain/PeranPengguna.js";
import { modelToPengguna } from "./model/converters.js";

export class RepositoriPengguna {
  private constructor() {}

  static readonly instance = new RepositoriPengguna();

  async getPenggunaByEmail(email: string, besertaPeran: boolean = true): Promise<Pengguna | null> {
    const modelPengguna = await ModelPengguna.findOne({ where: { email } });
    if (!modelPengguna) {
      return null;
    }
    const pengguna = modelToPengguna(modelPengguna);

    if (besertaPeran) {
      const listModelPeran = await ModelPeranPengguna.findAll({
        where: {
          id_pengguna: pengguna.id,
        },
      });
      for (const modelPeran of (listModelPeran as any[])) {
        let peranInt = 0;
        if (typeof modelPeran.peran === "number") {
          peranInt = modelPeran.peran;
        }
        const peran = intToPeranPengguna(peranInt);
        if (peran !== null) {
          pengguna.peran.push(peran);
        }
      }
    }

    return pengguna;
  }

  async getPenggunaById(id: number): Promise<Pengguna | null> {
    const modelPengguna = await ModelPengguna.findOne({ where: { id } });
    if (!modelPengguna) {
      return null;
    }

    const pengguna = modelToPengguna(modelPengguna);
    return pengguna;
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await ModelPengguna.update(
      { password: passwordHash },
      { where: { email } },
    );
  }
}
