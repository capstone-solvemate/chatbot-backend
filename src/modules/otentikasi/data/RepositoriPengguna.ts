import type { Pengguna } from "../domain/Pengguna.js";

import { modelToPengguna } from "./model/converters.js";
import { ModelPengguna } from "./model/ModelPengguna.js";

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
}
