import type { Request, Response } from "express";

import { ValidationError } from "~/core/types/ValidationError.js";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import type { RepositoriFaq } from "../data/RepositoriFaq.js";
import type { GetFaqsResponseDto } from "./dto/GetFaqsResponseDto.js";

import { faqToDto, faqToDtoAdmin, submitDtoToFaq } from "./converters.js";
import { validasiGetFaqsRequest, validasiSubmitFaq } from "./validators.js";

export class KontrolFaq {
  constructor(
    private readonly repositoriFaq: RepositoriFaq,
  ) {}

  // ─── Existing ──────────────────────────────────────────────────────────────

  async getFaqs(req: Request, res: Response) {
    const reqData = validasiGetFaqsRequest(req);
    const daftarFaq = await this.repositoriFaq.getDaftarFaq(reqData.idkategori, reqData.query);
    const total = await this.repositoriFaq.countAll();

    const responseData: GetFaqsResponseDto = {
      faqs: daftarFaq.map(req.sesiPengguna?.peranPengguna === PeranPengguna.Admin ? faqToDtoAdmin : faqToDto),
      total,
    };
    res.status(200).send(responseData);
  }

  async createFaq(req: Request, res: Response) {
    const reqData = validasiSubmitFaq(req);
    const faq = submitDtoToFaq(reqData);
    await this.repositoriFaq.insert(faq);
    res.sendStatus(201);
  }

  async updateFaq(req: Request, res: Response) {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      res.sendStatus(404);
      return;
    }

    const reqData = validasiSubmitFaq(req);
    const faq = submitDtoToFaq(reqData);
    faq.id = id;

    await this.repositoriFaq.update(faq);
    res.sendStatus(200);
  }

  async deleteFaq(req: Request, res: Response) {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      res.sendStatus(404);
      return;
    }

    await this.repositoriFaq.delete(id);
    res.sendStatus(204);
  }

  // ─── View Log ──────────────────────────────────────────────────────────────

  /**
   * POST /api/faq/:id/lihat
   * Dipanggil frontend saat pengguna membuka detail FAQ.
   */
  async catatView(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError([{
        field: "id",
        error: "invalid",
        message: "id faq tidak valid.",
      }]);
    }

    const idPengguna = req.sesiPengguna?.idPengguna ?? null;
    await this.repositoriFaq.catatView(id, idPengguna);
    res.sendStatus(204);
  }

  // ─── Survei ────────────────────────────────────────────────────────────────

  /**
   * POST /api/faq/:id/survei
   * Body: { jawaban: true | false }
   * Upsert — pengguna boleh mengubah vote.
   */
  async submitSurvei(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError([{
        field: "id",
        error: "invalid",
        message: "id faq tidak valid.",
      }]);
    }

    const jawaban = req.body?.jawaban;
    if (typeof jawaban !== "boolean") {
      throw new ValidationError([{
        field: "jawaban",
        error: "invalid",
        message: "jawaban harus berupa boolean (true/false).",
      }]);
    }

    const idPengguna = req.sesiPengguna!.idPengguna!;
    await this.repositoriFaq.upsertSurvei(id, idPengguna, jawaban);
    res.sendStatus(204);
  }

  /**
   * GET /api/faq/:id/survei
   * Kembalikan jawaban survei pengguna saat ini. null = belum pernah vote.
   */
  async getSurveiku(req: Request, res: Response): Promise<void> {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError([{
        field: "id",
        error: "invalid",
        message: "id faq tidak valid.",
      }]);
    }

    const idPengguna = req.sesiPengguna!.idPengguna!;
    const jawaban = await this.repositoriFaq.getSurveiBySesiPengguna(id, idPengguna);
    res.json({ jawaban });
  }

  // ─── Popular FAQs ──────────────────────────────────────────────────────────

  /**
   * GET /api/faq/populer
   * Endpoint untuk home page — limit 6 sesuai desain UI.
   */
  async getFaqPopuler(req: Request, res: Response): Promise<void> {
    const faqs = await this.repositoriFaq.getFaqPopuler(6);
    res.json({ success: true, data: faqs.map(faq => faqToDto(faq)) });
  }
}
