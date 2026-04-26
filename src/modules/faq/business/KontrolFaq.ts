import type { Request, Response } from "express";

import type { GetFaqsResponseDto } from "./dto/GetFaqsResponseDto.js";

import { RepositoriFaq } from "../data/RepositoriFaq.js";
import { faqToDto } from "./converters.js";

export class KontrolFaq {
  static readonly instance = new KontrolFaq();
  private constructor() {}

  private readonly repositoriFaq = RepositoriFaq.instance;

  async getFaqs(req: Request, res: Response) {
    const daftarFaq = await this.repositoriFaq.getDaftarFaq(null, null);
    const total = await this.repositoriFaq.countAll();

    const responseData: GetFaqsResponseDto = {
      faqs: daftarFaq.map(faq => faqToDto(faq)),
      total,
    };
    res.status(200);
    res.send(responseData);
  }
}
