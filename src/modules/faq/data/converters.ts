import { Faq } from "../domain/Faq.js";

export function faqToModel(faq: Faq): Record<string, any> {
  return {
    id: faq.id,
    id_kategori: faq.idKategori,
    answer: faq.answer,
    question: faq.question,
  };
}

export function modelToFaq(model: any): Faq {
  return new Faq(
    model.id,
    model.id_kategori,
    model.question,
    model.answer,
  );
}
