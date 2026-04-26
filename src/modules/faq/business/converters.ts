import type { Faq } from "../domain/Faq.js";

export function faqToDto(faq: Faq): Record<string, any> {
  return {
    id: faq.id,
    idKategori: faq.idKategori,
    answer: faq.answer,
    question: faq.question,
  };
}
