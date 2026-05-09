import { Op } from "sequelize";

import type { KnowledgeBase } from "../domain/KnowledgeBase.js";
import type { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";

import { ModelKnowledgeBase } from "../../../models/ModelKnowledgeBase.js";
import { knowledgeBaseToRow, modelToKnowledgeBase } from "./converters.js";

export type FilterDokumen = {
  idKategori?: number;
  judul?: string;
};

export class RepositoriKnowledgeBase {
  private constructor() {}
  static readonly instance = new RepositoriKnowledgeBase();

  async buatDokumen(kb: KnowledgeBase): Promise<KnowledgeBase> {
    const doc = await ModelKnowledgeBase.create(knowledgeBaseToRow(kb));
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

    const docs = await ModelKnowledgeBase.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
    return docs.map(d => modelToKnowledgeBase(d.toJSON()));
  }

  async getDokumenById(id: bigint): Promise<KnowledgeBase | null> {
    const doc = await ModelKnowledgeBase.findByPk(id.toString());
    if (!doc)
      return null;
    return modelToKnowledgeBase(doc.toJSON());
  }

  async hapusDokumen(id: bigint): Promise<boolean> {
    const deleted = await ModelKnowledgeBase.destroy({
      where: { id: id.toString() },
    });
    return deleted > 0;
  }

  async updateStatus(id: bigint, status: StatusKnowledgeBase): Promise<boolean> {
    const [updated] = await ModelKnowledgeBase.update({ status }, {
      where: { id: id.toString() },
    });
    return updated > 0;
  }
}
