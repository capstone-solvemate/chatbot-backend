import { Kategori } from "../domain/Kategori.js";

export function kategoriToModel(kategori: Kategori): Record<string, any> {
  return {
    id: kategori.id,
    nama: kategori.nama,
  };
}

export function modelToKategori(model: any): Kategori {
  return new Kategori(
    model.id,
    model.nama,
  );
}
