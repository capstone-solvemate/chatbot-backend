import { describe, expect, it } from "vitest";

import { buatContohChat, parameterContohChat } from "../../domain/ChatStub.js";
import { buatContohLampiranPesanChat, parameterContohLampiranPesanChat } from "../../domain/LampiranPesanChatStub.js";
import { buatContohPesanChat, parameterContohPesanChat } from "../../domain/PesanChatStub.js";
import { RowConverterChat } from "./RowConverterChat.js";

describe("RowConverterChat", () => {
  describe("fungsi chatKeRow", () => {
    it("harus mengonversi objek Chat ke objek row chat dengan benar", () => {
      const chat = buatContohChat();

      const converter = new RowConverterChat();

      const hasil = converter.chatKeRow(chat);

      expect(hasil.id).toBe(parameterContohChat.id);
      expect(hasil.id_pembuat).toBe(parameterContohChat.idPembuat);
      expect(hasil.tanggal_dibuat).toBe(parameterContohChat.tanggalDibuat);
      expect(hasil.subjek).toBe(parameterContohChat.subjek);
      expect(hasil.sedang_diproses).toBe(parameterContohChat.sedangDiproses);
      expect(hasil.dialihkan_ke_tiket).toBe(parameterContohChat.dialihkanKeTiket);
    });
  });

  describe("fungsi pesanChatKeRow", () => {
    it("harus mengonversi objek PesanChat ke objek row chat dengan benar", () => {
      const pesanChat = buatContohPesanChat();

      const converter = new RowConverterChat();

      const hasil = converter.pesanChatKeRow(pesanChat);

      expect(hasil.id).toBe(parameterContohPesanChat.id);
      expect(hasil.id_chat).toBe(parameterContohPesanChat.idChat);
      expect(hasil.pesan).toBe(parameterContohPesanChat.pesan);
      expect(hasil.tanggal_dibuat).toBe(parameterContohPesanChat.tanggalDibuat);
      expect(hasil.chat_asisten).toBe(parameterContohPesanChat.chatAsisten);
      expect(hasil.gagal).toBe(parameterContohPesanChat.gagal);
    });
  });

  describe("fungsi lampiranPesanChatKeRow", () => {
    it("harus mengonversi objek LampiranPesanChat ke objek row chat dengan benar", () => {
      const lampiranPesanChat = buatContohLampiranPesanChat();

      const converter = new RowConverterChat();

      const hasil = converter.lampiranPesanChatKeRow(lampiranPesanChat);

      expect(hasil.id).toBe(parameterContohLampiranPesanChat.id);
      expect(hasil.id_pesan_chat).toBe(parameterContohLampiranPesanChat.idPesanChat);
      expect(hasil.nama_berkas).toBe(parameterContohLampiranPesanChat.namaBerkas);
      expect(hasil.path).toBe(parameterContohLampiranPesanChat.path);
      expect(hasil.ukuran).toBe(parameterContohLampiranPesanChat.ukuran);
    });
  });
});
