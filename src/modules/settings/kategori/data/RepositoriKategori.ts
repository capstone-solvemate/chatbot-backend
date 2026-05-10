import type { Model, ModelStatic } from "sequelize";

import type { Kategori } from "../domain/Kategori.js";

import { modelToKategori } from "./converters.js";

export class RepositoriKategori {
  constructor(
    private readonly modelKategori: ModelStatic<Model<any, any>>,
  ) {}

  async getDaftarKategori(): Promise<Kategori[]> {
    const daftarModelKategori = await this.modelKategori.findAll({
      order: [
        ["nama", "ASC"],
      ],
    });
    const daftarKategori = daftarModelKategori.map(model => modelToKategori(model));
    return daftarKategori;
  }

  async getById(id: number): Promise<Kategori | null> {
    const row = await this.modelKategori.findByPk(id);
    return row ? modelToKategori(row) : null;
  }

  async tambahKategori(nama: string): Promise<Kategori> {
    const row = await this.modelKategori.create({ nama });
    return modelToKategori(row);
  }

  async editKategori(id: number, nama: string): Promise<void> {
    await this.modelKategori.update({ nama }, { where: { id } });
  }

  /**
   * Mengembalikan false jika DB melempar foreign key constraint error (RESTRICT),
   * sehingga controller bisa mengubahnya menjadi ValidationError yang informatif.
   */
  async hapusKategori(id: number): Promise<boolean> {
    try {
      const deleted = await this.modelKategori.destroy({ where: { id } });
      return deleted > 0;
    }
    catch (e: any) {
      // Sequelize membungkus FK constraint error sebagai SequelizeForeignKeyConstraintError
      if (e.name === "SequelizeForeignKeyConstraintError") {
        return false;
      }
      throw e;
    }
  }
}
