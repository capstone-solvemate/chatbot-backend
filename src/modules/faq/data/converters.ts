import { Faq } from "../domain/Faq.js";

export function faqToRow(faq: Faq): Record<string, any> {
  return {
    id: faq.id,
    id_kategori: faq.idKategori,
    answer: faq.answer,
    question: faq.question,
    jumlah_dilihat: faq.jumlahDilihat,
    jumlah_helpful: faq.jumlahHelpful,
  };
}

export function modelToFaq(model: any): Faq {
  return new Faq(
    model.id,
    model.id_kategori,
    model.question,
    model.answer,
    model.jumlah_dilihat ?? 0,
    model.jumlah_helpful ?? 0,
  );
}
