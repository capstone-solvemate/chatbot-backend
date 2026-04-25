import type { Kategori } from "../domain/Kategori.js";

export function kategoriToDto(kategori: Kategori): Record<string, any> {
  return {
    id: kategori.id,
    nama: kategori.nama,
  };
}
