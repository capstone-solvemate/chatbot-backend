import { describe, expect, it } from "vitest";

import { LampiranPesanChat } from "./LampiranPesanChat.js";

describe("LampiranPesanChat", () => {
  describe("constructor", () => {
    it("harus throw error jika panjang parameter 'namaBerkas' lebih dari 100 karakter", () => {
      const namaBerkasSalah = Array.from({ length: 101 }).fill("a").join("");
      expect(() => {
        const _ = new LampiranPesanChat(1n, 1n, namaBerkasSalah, "", 10n);
      }).toThrow();
    });

    it("dilarang throw error jika panjang parameter 'namaBerkas' kurang atau sama dengan 100 karakter", () => {
      const namaBerkasBenar = Array.from({ length: 50 }).fill("a").join("");
      expect(() => {
        const _ = new LampiranPesanChat(1n, 1n, namaBerkasBenar, "", 10n);
      }).not.toThrow();
    });
  });
});
