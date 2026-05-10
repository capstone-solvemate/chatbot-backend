import type { SubmitFaqDto } from "./dto/SubmitFaqDto.js";

import { Faq } from "../domain/Faq.js";

export function faqToDtoAdmin(faq: Faq): Record<string, any> {
  return {
    id: faq.id,
    idKategori: faq.idKategori,
    answer: faq.answer,
    question: faq.question,
    jumlahDilihat: faq.jumlahDilihat,
    jumlahHelpful: faq.jumlahHelpful,
  };
}

export function faqToDto(faq: Faq): Record<string, any> {
  return {
    id: faq.id,
    idKategori: faq.idKategori,
    answer: faq.answer,
    question: faq.question,
  };
}

export function submitDtoToFaq(dto: SubmitFaqDto): Faq {
  return new Faq(0, dto.idKategori, dto.question, dto.answer);
}
