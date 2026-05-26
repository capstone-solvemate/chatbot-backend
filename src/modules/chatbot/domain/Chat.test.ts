import { describe, expect, it } from "vitest";

import { Chat } from "./Chat.js";

describe("Chat", () => {
  describe("constructor", () => {
    it("harus throw error jika panjang parameter 'subjek' lebih dari 50 karakter", () => {
      const contohSubjekSalah = Array.from({ length: 51 }).fill("a").join("");
      expect(() => {
        const _chat = new Chat(1n, 1, new Date(), contohSubjekSalah, false, false);
      }).toThrow();
    });

    it("dilarang throw error jika panjang parameter 'subjek' kurang atau sama dengan 50 karakter", () => {
      const contohSubjekBenar = Array.from({ length: 50 }).fill("a").join("");
      expect(() => {
        const _chat = new Chat(1n, 1, new Date(), contohSubjekBenar, false, false);
      }).not.toThrow();
    });
  });
});
