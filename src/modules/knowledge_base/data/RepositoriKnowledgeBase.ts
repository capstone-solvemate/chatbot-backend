import type { Model, ModelStatic } from "sequelize";

import { Op } from "sequelize";

import type { KnowledgeBase } from "../domain/KnowledgeBase.js";
import type { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";

import { statusKnowledgeBaseToInt } from "../domain/StatusKnowledgeBase.js";
import { knowledgeBaseToRow, modelToKnowledgeBase } from "./converters.js";

export type FilterDokumen = {
  idKategori?: number;
  judul?: string;
};

export class RepositoriKnowledgeBase {
  constructor(
    private modelKnowledgeBase: ModelStatic<Model<any, any>>,
  ) {}

  async buatDokumen(kb: KnowledgeBase): Promise<KnowledgeBase> {
    const doc = await this.modelKnowledgeBase.create(knowledgeBaseToRow(kb));
    return modelToKnowledgeBase(doc.toJSON());
  }

  async getSemuaDokumen(filter: FilterDokumen = {}): Promise<KnowledgeBase[]> {
    const where: Record<string, any> = {};

    if (filter.idKategori !== undefined) {
      where.id_kategori = filter.idKategori;
    }

    if (filter.judul !== undefined && filter.judul.trim() !== "") {
      where.judul = { [Op.like]: `%${filter.judul.trim()}%` };
    }

    const docs = await this.modelKnowledgeBase.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return docs.map(d => modelToKnowledgeBase(d.toJSON()));
  }

  async getDokumenById(id: bigint): Promise<KnowledgeBase | null> {
    const doc = await this.modelKnowledgeBase.findByPk(id.toString());
    if (!doc)
      return null;
    return modelToKnowledgeBase(doc.toJSON());
  }

  async hapusDokumen(id: bigint): Promise<boolean> {
    const deleted = await this.modelKnowledgeBase.destroy({
      where: { id: id.toString() },
    });
    return deleted > 0;
  }

  async updateStatus(id: bigint, status: StatusKnowledgeBase): Promise<boolean> {
    const [updated] = await this.modelKnowledgeBase.update({ status: statusKnowledgeBaseToInt(status) }, {
      where: { id: id.toString() },
    });
    return updated > 0;
  }
}
