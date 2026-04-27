import type { Request, Response } from "express";

import type { GetFaqsResponseDto } from "./dto/GetFaqsResponseDto.js";

import { RepositoriFaq } from "../data/RepositoriFaq.js";
import { faqToDto, submitDtoToFaq } from "./converters.js";
import { validasiGetFaqsRequest, validasiSubmitFaq } from "./validators.js";

export class KontrolFaq {
  static readonly instance = new KontrolFaq();
  private constructor() {}

  private readonly repositoriFaq = RepositoriFaq.instance;

  async getFaqs(req: Request, res: Response) {
    const reqData = validasiGetFaqsRequest(req);
    const daftarFaq = await this.repositoriFaq.getDaftarFaq(reqData.idkategori, reqData.query);
    const total = await this.repositoriFaq.countAll();

    const responseData: GetFaqsResponseDto = {
      faqs: daftarFaq.map(faq => faqToDto(faq)),
      total,
    };
    res.status(200);
    res.send(responseData);
  }

  async createFaq(req: Request, res: Response) {
    const reqData = validasiSubmitFaq(req);
    const faq = submitDtoToFaq(reqData);
    await this.repositoriFaq.insert(faq);
    res.sendStatus(201);
  }

  async updateFaq(req: Request, res: Response) {
    const idStr = req.params.id;
    const id = Number.parseInt(idStr);
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
    const idStr = req.params.id;
    const id = Number.parseInt(idStr);
    if (Number.isNaN(id) || id < 1) {
      res.sendStatus(404);
      return;
    }

    await this.repositoriFaq.delete(id);
    res.sendStatus(204);
  }
}
