import { ModelKategori } from "~/models/ModelKategori.js";

import type { Kategori } from "../domain/Kategori.js";

import { modelToKategori } from "./converters.js";

export class RepositoriKategori {
  static readonly instance = new RepositoriKategori();
  private constructor() {}

  async getDaftarKategori(): Promise<Kategori[]> {
    const daftarModelKategori = await ModelKategori.findAll({
      order: [
        ["nama", "ASC"],
      ],
    });
    const daftarKategori = daftarModelKategori.map(model => modelToKategori(model));
    return daftarKategori;
  }
}
