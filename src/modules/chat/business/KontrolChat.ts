import type { Request, Response } from "express";
import type WebSocket from "ws";

import { DI } from "~/di/DI.js";

import type { KoneksiChat } from "../domain/KoneksiChat.js";

import { validasiBalasChat, validasiPertanyaan } from "../domain/Dto.js";

export class KontrolChat {
  private constructor() {}
  static readonly instance = new KontrolChat();

  private readonly repositoriChat = DI.provideRepositoriChat();
  private readonly chatWsManager = DI.provideChatWsManager();
  private readonly ragWorkerClient = DI.provideRagWorkerClient();

  /**
   * POST /api/chat
   * Buat sesi chat baru, simpan pesan pertama, trigger RAG async.
   */
  async submitPertanyaan(req: Request, res: Response): Promise<void> {
    const dto = validasiPertanyaan(req.body);
    const idPembuat = req.sesiPengguna!.idPengguna!;

    const subjek = dto.pesan.length > 50
      ? `${dto.pesan.substring(0, 50)}...`
      : dto.pesan;
    const chatBaru = await this.repositoriChat.buatChat(idPembuat, subjek);
    const idChat = chatBaru.id;

    const pesanKaryawan = await this.repositoriChat.tambahPesanChat(idChat, dto.pesan, false);

    // Trigger RAG async — history hanya berisi pesan pertama
    this.ragWorkerClient.tambahTugas(idChat, [
      { role: "user", content: dto.pesan },
    ]);

    res.status(200).json({
      idChat: idChat.toString(),
      pesan: {
        id: pesanKaryawan.id.toString(),
        pesan: pesanKaryawan.pesan,
        tanggalDibuat: pesanKaryawan.tanggalDibuat,
      },
    });
  }

  /**
   * POST /api/chat/:idChat
   * Balas pesan dalam sesi chat yang sudah ada, trigger RAG async dengan history lengkap.
   */
  async balasChat(req: Request, res: Response): Promise<void> {
    const dto = validasiBalasChat(req.body);
    const idPembuat = req.sesiPengguna!.idPengguna!;
    const idChat = BigInt(req.params.idChat);

    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat || chat.idPembuat !== idPembuat) {
      res.status(404).json({ error: "not_found", message: "Chat tidak ditemukan" });
      return;
    }

    // Ambil histori untuk dikirim ke RAG
    const historiPesan = await this.repositoriChat.getHistoriPesan(idChat);
    const pesanKaryawan = await this.repositoriChat.tambahPesanChat(idChat, dto.pesan, false);

    // Bangun history: pesan lama + pesan baru
    const history = [
      ...historiPesan.map(p => ({
        role: p.chatAsisten ? "assistant" as const : "user" as const,
        content: p.pesan,
      })),
      { role: "user" as const, content: dto.pesan },
    ];

    // Trigger RAG async
    this.ragWorkerClient.tambahTugas(idChat, history);

    res.status(200).json({
      idChat: idChat.toString(),
      pesan: {
        id: pesanKaryawan.id.toString(),
        pesan: pesanKaryawan.pesan,
        tanggalDibuat: pesanKaryawan.tanggalDibuat,
      },
    });
  }

  /**
   * GET /api/chat
   * Riwayat semua sesi chat milik pengguna.
   */
  async getRiwayatChat(req: Request, res: Response): Promise<void> {
    const idPembuat = req.sesiPengguna!.idPengguna!;
    const chats = await this.repositoriChat.getSemuaChatPengguna(idPembuat);

    res.status(200).json(chats.map(c => ({
      id: c.id.toString(),
      subjek: c.subjek,
      tanggalDibuat: c.tanggalDibuat,
    })));
  }

  /**
   * GET /api/chat/:id
   * Detail pesan dalam satu sesi chat.
   */
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
      })),
    });
  }

  /**
   * WS /api/chat/:idChat/ws
   * Handle koneksi WebSocket baru — verifikasi kepemilikan chat,
   * daftarkan ke ChatWsManager, handle pesan masuk dan disconnect.
   */
  async handleWsConnect(
    ws: WebSocket,
    idChat: bigint,
    idPembuat: number,
    idSession: string,
  ): Promise<void> {
    // Verifikasi kepemilikan chat
    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat || chat.idPembuat !== idPembuat) {
      ws.close(4004, "Chat tidak ditemukan");
      return;
    }

    // Daftarkan koneksi
    const koneksi: KoneksiChat = { ws, idChat, idSession };
    this.chatWsManager.tambah(koneksi);

    ws.on("close", () => {
      this.chatWsManager.hapus(koneksi);
    });

    ws.on("error", (err) => {
      console.error(
        new Date().toISOString(),
        `[KontrolChat] WS error idChat=${idChat}:`,
        err.message,
      );
      this.chatWsManager.hapus(koneksi);
    });
  }
}
