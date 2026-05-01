import type { Request, Response } from "express";

import { queryRAG } from "../../../lib/rag.js";

import { validasiPertanyaan } from "../domain/Dto.js";
import { RepositoriChat } from "../data/RepositoriChat.js";

export class KontrolChat {
  private constructor() {}
  static readonly instance = new KontrolChat();

  private readonly repositoriChat = RepositoriChat.instance;

  async submitPertanyaan(req: Request, res: Response): Promise<void> {
    const dto = validasiPertanyaan(req.body);
    const idPembuat = req.sesiPengguna!.idPengguna!;
    
    let idChat: bigint;

    if (dto.idChat) {
      idChat = BigInt(dto.idChat);
      const chatExist = await this.repositoriChat.getChatById(idChat);
      if (!chatExist || chatExist.idPembuat !== idPembuat) {
        res.status(404).json({ error: "not_found", message: "Chat tidak ditemukan" });
        return;
      }
    } else {
      // Create new chat if idChat is not provided
      const subjek = dto.pesan.substring(0, 50) + (dto.pesan.length > 50 ? "..." : "");
      const chatBaru = await this.repositoriChat.buatChat(idPembuat, subjek);
      idChat = chatBaru.id;
    }

    // Save user's question
    const pesanKaryawan = await this.repositoriChat.tambahPesanChat(idChat, dto.pesan, false);

    try {
      // Call RAG Simulator
      const jawabanAsisten = await queryRAG(dto.pesan);
      
      // Save assistant's answer
      const pesanAsisten = await this.repositoriChat.tambahPesanChat(idChat, jawabanAsisten, true);

      res.status(200).json({
        idChat: idChat.toString(),
        pertanyaan: {
          id: pesanKaryawan.id.toString(),
          pesan: pesanKaryawan.pesan,
          tanggalDibuat: pesanKaryawan.tanggalDibuat,
        },
        jawaban: {
          id: pesanAsisten.id.toString(),
          pesan: pesanAsisten.pesan,
          tanggalDibuat: pesanAsisten.tanggalDibuat,
        }
      });
    } catch (error: any) {
      console.error("RAG Error:", error.message);
      // In case RAG fails, we still return the user's message but indicate failure
      res.status(503).json({
        error: "service_unavailable",
        message: "Gagal terhubung ke layanan Asisten AI (RAG)",
        detail: error.message
      });
    }
  }

  async getRiwayatChat(req: Request, res: Response): Promise<void> {
    const idPembuat = req.sesiPengguna!.idPengguna!;
    const chats = await this.repositoriChat.getSemuaChatPengguna(idPembuat);
    
    res.status(200).json(chats.map(c => ({
      id: c.id.toString(),
      subjek: c.subjek,
      tanggalDibuat: c.tanggalDibuat,
    })));
  }

  async getDetailChat(req: Request, res: Response): Promise<void> {
    const idPembuat = req.sesiPengguna!.idPengguna!;
    const idChat = BigInt(req.params.id);

    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat || chat.idPembuat !== idPembuat) {
      res.status(404).json({ error: "not_found", message: "Chat tidak ditemukan" });
      return;
    }

    const pesan = await this.repositoriChat.getHistoriPesan(idChat);
    
    res.status(200).json({
      id: chat.id.toString(),
      subjek: chat.subjek,
      tanggalDibuat: chat.tanggalDibuat,
      pesan: pesan.map(p => ({
        id: p.id.toString(),
        pesan: p.pesan,
        chatAsisten: p.chatAsisten,
        tanggalDibuat: p.tanggalDibuat,
      }))
    });
  }
}
