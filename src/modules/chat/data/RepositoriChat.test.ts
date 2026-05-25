import type { Model, ModelStatic } from "sequelize";

import { describe, expect, it } from "vitest";

import { Chat } from "../domain/Chat.js";
import { RepositoriChat } from "./RepositoriChat.js";

const mockModelChat = {

} as unknown as ModelStatic<Model>;

const mockModelPesanChat = {

} as unknown as ModelStatic<Model>;

describe("RepositoriChat", () => {
  describe("fungsi chatKeRow", () => {
    it("harus mengonversi objek Chat ke objek row dengan benar", () => {
      const id = 3n;
      const idPembuat = 8;
      const tanggalDibuat = new Date("2024-06-20 05:00:00");
      const subjek = "How to resolve paper jam?";
      const sedangDiproses = false;
      const dialihkanKeTiket = true;

      const chat = new Chat(id, idPembuat, tanggalDibuat, subjek, sedangDiproses, dialihkanKeTiket);

      const repositori = new RepositoriChat(
        mockModelChat,
        mockModelPesanChat,
      );

      const hasil = repositori.testChatKeRow(chat);

      expect(hasil.id).toBe(id);
      expect(hasil.id_pembuat).toBe(idPembuat);
      expect(hasil.tanggal_dibuat).toBe(tanggalDibuat);
      expect(hasil.subjek).toBe(subjek);
      expect(hasil.sedang_diproses).toBe(sedangDiproses);
      expect(hasil.dialihkan_ke_tiket).toBe(dialihkanKeTiket);
    });
  });
});
