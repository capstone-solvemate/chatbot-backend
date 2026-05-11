import type { Request, Response } from "express";
import type WebSocket from "ws";

import type { RepositoriChat } from "../data/RepositoriChat.js";
import type { KoneksiChat } from "../domain/KoneksiChat.js";
import type { ChatWsManager } from "./ChatWsManager.js";
import type { RagWorkerClient } from "./RagWorkerClient.js";

import { validasiBalasChat, validasiPertanyaan } from "../domain/Dto.js";

export class KontrolChat {
  constructor(
    private readonly repositoriChat: RepositoriChat,
    private readonly chatWsManager: ChatWsManager,
    private readonly ragWorkerClient: RagWorkerClient,
  ) {
    // Fire and forget — reset chat yang sedang_diproses = true akibat restart
    this.selesaikanChatYangTerputus();
  }

  /**
   * Dipanggil saat startup — reset semua chat yang tertinggal dalam kondisi
   * sedang_diproses = true akibat server restart di tengah pemrosesan RAG.
   */
  private selesaikanChatYangTerputus(): void {
    this.repositoriChat
      .pulihkanChatTerputus()
      .then((jumlah) => {
        if (jumlah > 0) {
          console.warn(
            new Date().toISOString(),
            `[KontrolChat] ${jumlah} chat dipulihkan dari kondisi terputus akibat restart.`,
          );
        }
      })
      .catch((err) => {
        console.error(
          new Date().toISOString(),
          "[KontrolChat] Gagal memulihkan chat terputus saat startup:",
          err,
        );
      });
  }

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
      res.status(404).json({ error: "not_found", message: "Chat tidak ditemukan." });
      return;
    }

    if (chat.dialihkanKeTiket) {
      res.status(409).json({ error: "dialihkan_ke_tiket", message: "Chat ini sudah dialihkan ke tiket dan tidak bisa dibalas." });
      return;
    }

    if (chat.sedangDiproses) {
      res.status(409).json({ error: "sedang_diproses", message: "Tunggu hingga jawaban sebelumnya selesai." });
      return;
    }

    const historiPesan = await this.repositoriChat.getHistoriPesan(idChat);
    const pesanKaryawan = await this.repositoriChat.tambahPesanChat(idChat, dto.pesan, false);

    const history = [
      ...historiPesan.map(p => ({
        role: p.chatAsisten ? "assistant" as const : "user" as const,
        content: p.pesan,
      })),
      { role: "user" as const, content: dto.pesan },
    ];

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
      sedangDiproses: c.sedangDiproses,
      dialihkanKeTiket: c.dialihkanKeTiket,
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
      res.status(404).json({ error: "not_found", message: "Chat tidak ditemukan." });
      return;
    }

    const pesan = await this.repositoriChat.getHistoriPesan(idChat);

    res.status(200).json({
      id: chat.id.toString(),
      subjek: chat.subjek,
      tanggalDibuat: chat.tanggalDibuat,
      sedangDiproses: chat.sedangDiproses,
      dialihkanKeTiket: chat.dialihkanKeTiket,
      pesan: pesan.map(p => ({
        id: p.id.toString(),
        pesan: p.pesan,
        chatAsisten: p.chatAsisten,
        tanggalDibuat: p.tanggalDibuat,
        gagal: p.gagal,
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
    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat || chat.idPembuat !== idPembuat) {
      ws.close(4004, "Chat tidak ditemukan");
      return;
    }

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
