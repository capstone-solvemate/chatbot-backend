import type { Model, ModelStatic } from "sequelize";

import { Op } from "sequelize";

import type { Faq } from "../domain/Faq.js";

import { faqToModel, modelToFaq } from "./converters.js";

export class RepositoriFaq {
  constructor(
    private readonly modelFaq: ModelStatic<Model<any, any>>,
  ) {}

  async getDaftarFaq(idKategori: number | null, searchQuery: string | null): Promise<Faq[]> {
    const whereQuery: Record<string, any> = {};
    if (idKategori !== null) {
      whereQuery.id_kategori = idKategori;
    }
    if (searchQuery !== null) {
      whereQuery.question = {
        [Op.like]: `%${searchQuery}%`,
      };
    }

    const daftarModelFaq: any[] = await this.modelFaq.findAll({
      where: whereQuery,
    });

    const daftarFaq = daftarModelFaq.map(modelFaq => modelToFaq(modelFaq));
    return daftarFaq;
  }

  async countAll(): Promise<number> {
    return await this.modelFaq.count();
  }

  async insert(faq: Faq): Promise<void> {
    const { id, ...modelFaq } = faqToModel(faq);
    await this.modelFaq.create(modelFaq);
  }

  async update(faq: Faq): Promise<void> {
    const { id, ...modelFaq } = faqToModel(faq);
    await this.modelFaq.update(modelFaq, {
      where: {
        id,
      },
    });
  }

  async delete(idFaq: number): Promise<void> {
    await this.modelFaq.destroy({
      where: {
        id: idFaq,
      },
    });
  }
}
