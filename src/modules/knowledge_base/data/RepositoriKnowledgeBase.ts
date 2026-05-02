import { ModelKnowledgeBase } from "../../../models/ModelKnowledgeBase.js";
import type { DokumenKB, StatusDokumen } from "../domain/KnowledgeBase.js";

export class RepositoriKnowledgeBase {
  private constructor() {}
  static readonly instance = new RepositoriKnowledgeBase();

  async buatDokumen(doc_id: string, nama_berkas: string, path: string): Promise<DokumenKB> {
    const doc = await ModelKnowledgeBase.create({
      doc_id,
      nama_berkas,
      path,
      status: 'BelumDiproses'
    });
    return doc.toJSON() as DokumenKB;
  }

  async getSemuaDokumen(): Promise<DokumenKB[]> {
    const docs = await ModelKnowledgeBase.findAll({
      order: [['createdAt', 'DESC']]
    });
    return docs.map(d => d.toJSON() as DokumenKB);
  }

  async getDokumenById(id: bigint): Promise<DokumenKB | null> {
    const doc = await ModelKnowledgeBase.findByPk(id.toString());
    if (!doc) return null;
    return doc.toJSON() as DokumenKB;
  }

  async hapusDokumen(id: bigint): Promise<boolean> {
    const deleted = await ModelKnowledgeBase.destroy({
      where: { id: id.toString() }
    });
    return deleted > 0;
  }

  async updateStatus(id: bigint, status: StatusDokumen): Promise<boolean> {
    const [updated] = await ModelKnowledgeBase.update({ status }, {
      where: { id: id.toString() }
    });
    return updated > 0;
  }
}
