import type { Model, ModelStatic } from "sequelize";

import { literal, Op } from "sequelize";

import type { Faq } from "../domain/Faq.js";

import { faqToRow, modelToFaq } from "./converters.js";

export class RepositoriFaq {
  constructor(
    private readonly modelFaq: ModelStatic<Model<any, any>>,
    private readonly modelFaqViewLog: ModelStatic<Model<any, any>>,
    private readonly modelFaqSurvei: ModelStatic<Model<any, any>>,
  ) {}

  // ─── Existing ──────────────────────────────────────────────────────────────

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

    return daftarModelFaq.map(modelFaq => modelToFaq(modelFaq));
  }

  async countAll(): Promise<number> {
    return await this.modelFaq.count();
  }

  async insert(faq: Faq): Promise<void> {
    const { id, ...modelFaq } = faqToRow(faq);
    await this.modelFaq.create(modelFaq);
  }

  async update(faq: Faq): Promise<void> {
    const { id, ...modelFaq } = faqToRow(faq);
    await this.modelFaq.update(modelFaq, {
      where: { id },
    });
  }

  async delete(idFaq: number): Promise<void> {
    await this.modelFaq.destroy({
      where: { id: idFaq },
    });
  }

  // ─── View Log ──────────────────────────────────────────────────────────────

  /**
   * Catat view dan increment cached counter jumlah_dilihat secara atomik.
   * Managed transaction — Sequelize otomatis commit/rollback.
   */
  async catatView(idFaq: number, idPengguna: number | null): Promise<void> {
    await this.modelFaq.sequelize!.transaction(async (tx) => {
      await this.modelFaqViewLog.create(
        {
          id_faq: idFaq,
          id_pengguna: idPengguna,
          dilihat_pada: new Date(),
        },
        { transaction: tx },
      );

      await this.modelFaq.increment("jumlah_dilihat", {
        by: 1,
        where: { id: idFaq },
        transaction: tx,
      });
    });
  }

  // ─── Survei ────────────────────────────────────────────────────────────────

  /**
   * Upsert jawaban survei, lalu hitung ulang jumlah_helpful dari tabel survei.
   * Jawaban bisa diubah Yes→No atau No→Yes, sehingga counter dihitung ulang
   * dari sumber kebenaran agar selalu konsisten.
   * Managed transaction — Sequelize otomatis commit/rollback.
   */
  async upsertSurvei(idFaq: number, idPengguna: number, jawaban: boolean): Promise<void> {
    await this.modelFaq.sequelize!.transaction(async (tx) => {
      await this.modelFaqSurvei.upsert(
        {
          id_faq: idFaq,
          id_pengguna: idPengguna,
          jawaban: jawaban ? 1 : 0,
          dijawab_pada: new Date(),
        },
        { transaction: tx },
      );

      // Hitung ulang dari sumber kebenaran — lebih aman dari delta +1/-1
      const jumlahHelpful = await this.modelFaqSurvei.count({
        where: { id_faq: idFaq, jawaban: 1 },
        transaction: tx,
      });

      await this.modelFaq.update(
        { jumlah_helpful: jumlahHelpful },
        { where: { id: idFaq }, transaction: tx },
      );
    });
  }

  /**
   * Ambil jawaban survei pengguna untuk FAQ tertentu.
   * Return null jika belum pernah vote.
   */
  async getSurveiBySesiPengguna(idFaq: number, idPengguna: number): Promise<boolean | null> {
    const survei = await this.modelFaqSurvei.findOne({
      where: { id_faq: idFaq, id_pengguna: idPengguna },
      attributes: ["jawaban"],
    });
    if (!survei)
      return null;
    return Boolean(survei.get("jawaban"));
  }

  // ─── Popular FAQs ──────────────────────────────────────────────────────────

  /**
   * Ambil N FAQ terpopuler berdasarkan skor:
   *   skor = (jumlah_dilihat * 0.3) + (jumlah_helpful * 0.7)
   *
   * Sangat cepat — hanya baca cached counter, tidak ada JOIN ke tabel log.
   */
  async getFaqPopuler(limit: number = 6): Promise<Faq[]> {
    const daftarModelFaq: any[] = await this.modelFaq.findAll({
      attributes: {
        include: [
          [
            literal("(jumlah_dilihat * 0.3 + jumlah_helpful * 0.7)"),
            "skor_populer",
          ],
        ],
      },
      order: [literal("skor_populer DESC")],
      limit,
    });
    return daftarModelFaq.map(m => modelToFaq(m));
  }
}
