import type { KnowledgeBase, StatusDokumen } from "../domain/KnowledgeBase.js";

import { ModelKnowledgeBase } from "../../../models/ModelKnowledgeBase.js";

export class RepositoriKnowledgeBase {
  private constructor() {}
  static readonly instance = new RepositoriKnowledgeBase();

  async buatDokumen(doc_id: string, nama_berkas: string, path: string): Promise<KnowledgeBase> {
    const doc = await ModelKnowledgeBase.create({
      doc_id,
      nama_berkas,
      path,
      status: "BelumDiproses",
    });
    return doc.toJSON() as KnowledgeBase;
  }

  async getSemuaDokumen(): Promise<KnowledgeBase[]> {
    const docs = await ModelKnowledgeBase.findAll({
      order: [["createdAt", "DESC"]],
    });
    return docs.map(d => d.toJSON() as KnowledgeBase);
  }

  async getDokumenById(id: bigint): Promise<KnowledgeBase | null> {
    const doc = await ModelKnowledgeBase.findByPk(id.toString());
    if (!doc)
      return null;
    return doc.toJSON() as KnowledgeBase;
  }

  async hapusDokumen(id: bigint): Promise<boolean> {
    const deleted = await ModelKnowledgeBase.destroy({
      where: { id: id.toString() },
    });
    return deleted > 0;
  }

  async updateStatus(id: bigint, status: StatusDokumen): Promise<boolean> {
    const [updated] = await ModelKnowledgeBase.update({ status }, {
      where: { id: id.toString() },
    });
    return updated > 0;
  }
}
