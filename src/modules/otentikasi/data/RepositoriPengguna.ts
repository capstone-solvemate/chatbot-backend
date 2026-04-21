import type { Pengguna } from "../domain/Pengguna.js";

import { ModelPengguna } from "../../../models/ModelPengguna.js";
import { modelToPengguna } from "./model/converters.js";

export class RepositoriPengguna {
  private constructor() {}

  static readonly instance = new RepositoriPengguna();

  async getPenggunaByEmail(email: string): Promise<Pengguna | null> {
    const modelPengguna = await ModelPengguna.findOne({ where: { email } });
    if (!modelPengguna) {
      return null;
    }

    const pengguna = modelToPengguna(modelPengguna);
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
}
