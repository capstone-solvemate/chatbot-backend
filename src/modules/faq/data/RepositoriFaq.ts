import { Op } from "sequelize";

import { ModelFaq } from "~/models/ModelFaq.js";

import type { Faq } from "../domain/Faq.js";

import { faqToModel, modelToFaq } from "./converters.js";

export class RepositoriFaq {
  static readonly instance = new RepositoriFaq();
  private constructor() {}

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

    const daftarModelFaq: any[] = await ModelFaq.findAll({
      where: whereQuery,
    });

    const daftarFaq = daftarModelFaq.map(modelFaq => modelToFaq(modelFaq));
    return daftarFaq;
  }

  async countAll(): Promise<number> {
    return await ModelFaq.count();
  }

  async insert(faq: Faq): Promise<void> {
    const { id, ...modelFaq } = faqToModel(faq);
    await ModelFaq.create(modelFaq);
  }

  async update(faq: Faq): Promise<void> {
    const { id, ...modelFaq } = faqToModel(faq);
    await ModelFaq.update(modelFaq, {
      where: {
        id,
      },
    });
  }

  async delete(idFaq: number): Promise<void> {
    await ModelFaq.destroy({
      where: {
        id: idFaq,
      },
    });
  }
}
