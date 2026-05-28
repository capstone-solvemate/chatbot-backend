import type { Request, Response } from "express";
import type WebSocket from "ws";

import type { WsContext } from "~/core/api/ws/types/WsContext.js";

import type { RepositoriLampiran } from "../../upload/data/RepositoriLampiran.js";
import type { JenisPesan } from "../../upload/domain/Lampiran.js";
import type { ManajerWsChat } from "../api/ws/ManajerWsChat.js";
import type { RepositoriChat } from "../data/RepositoriChat.js";
import type { ChatEventBus } from "../event/ChatEventBus.js";
import type { RagWorkerClient } from "./RagWorkerClient.js";

import { lampiranToDto } from "../../upload/domain/Lampiran.js";
import { KoneksiWsChat } from "../api/ws/KoneksiWsChat.js";
import { Chat } from "../domain/Chat.js";
import { validasiBalasChat, validasiPertanyaan } from "../domain/Dto.js";
import { LampiranPesanChat } from "../domain/LampiranPesanChat.js";
import { PesanChat } from "../domain/PesanChat.js";
import { validasiBuatChatDto } from "./dto/BuatChatDto.js";
import { validasiDimensiGambar } from "./dto/ValidatorUploadGambar.js";

/**
 * Menyimpan file-file dari req.files ke DB, langsung diasosiasikan ke idPesan.
 * Mengembalikan daftar lampiran DTO yang sudah tersimpan.
 */
async function simpanFileDariRequest(
  req: Request,
  idPengunggah: number,
  idPesan: bigint,
  jenisPesan: JenisPesan,
  repositoriLampiran: RepositoriLampiran,
) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0)
    return [];

  const hasilSimpan = await Promise.all(
    files.map(file =>
      repositoriLampiran.simpan({
        jenisPesan,
        idPesan,
        idPengunggah,
        namaAsli: file.originalname,
        namaBerkas: file.filename,
        path: file.path.replace(/\\/g, "/"),
        ukuran: file.size,
        mimeType: file.mimetype,
        dibuatPada: new Date(),
      }),
    ),
  );

  return hasilSimpan.map(lampiranToDto);
}

export class KontrolChat {
  constructor(
    private readonly repositoriChat: RepositoriChat,
    private readonly manajerWsChat: ManajerWsChat,
    private readonly ragWorkerClient: RagWorkerClient,
    private readonly chatEventBus: ChatEventBus,
    private readonly repositoriLampiran: RepositoriLampiran,
  ) {
    this.selesaikanChatYangTerputus();
  }

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

  async buatChat(req: Request, res: Response): Promise<void> {
    const dto = validasiBuatChatDto(req);

    const files = (req.files ?? []) as Express.Multer.File[];
    for (let i = 0; i < files.length; i++) {
      await validasiDimensiGambar(files[i], i);
    }

    const idPembuat = req.sesiPengguna!.idPengguna!;

    const subjekChat = dto.pesan.length > 50
      ? `${dto.pesan.substring(0, 47)}...`
      : dto.pesan;
    const chat = new Chat(0n, idPembuat, new Date(), subjekChat, true, false);
    await this.repositoriChat.buatChat(chat);

    const pesanChatKaryawan = new PesanChat(0n, chat.id, dto.pesan, chat.tanggalDibuat, false, false);
    await this.repositoriChat.buatPesanChat(pesanChatKaryawan);

    for (const file of files) {
      const lampiranPesanChat = new LampiranPesanChat(
        0n,
        pesanChatKaryawan.id,
        file.originalname,
        BigInt(file.size),
      );

      await this.repositoriChat.buatLampiranPesanChat(lampiranPesanChat, file);
    }

    // Simpan lampiran langsung dari form-data (jika ada)
    // const lampiran = await simpanFileDariRequest(
    //   req,
    //   idPembuat,
    //   pesanKaryawan.id,
    //   "chat",
    //   this.repositoriLampiran,
    // );

    this.chatEventBus.emit("chat_dibuat", {
      idChat: chat.id,
      idPembuat,
      subjek: chat.subjek,
      tanggalDibuat: chat.tanggalDibuat,
    });

    this.ragWorkerClient.tambahTugas(chat.id, [
      { role: "user", content: dto.pesan },
    ]);

    res.status(200).json({
      idChat: chat.id.toString(),
    });
  }

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
    // const pesanKaryawan = await this.repositoriChat.buatPesanChat(idChat, dto.pesan, false);

    // Simpan lampiran langsung dari form-data (jika ada)
    // const lampiran = await simpanFileDariRequest(
    //   req,
    //   idPembuat,
    //   pesanKaryawan.id,
    //   "chat",
    //   this.repositoriLampiran,
    // );

    // this.chatEventBus.emit("pesan_baru", {
    //   idChat,
    //   idPembuat,
    //   tanggalDibuat: pesanKaryawan.tanggalDibuat,
    // });

    // const history = [
    //   ...historiPesan.map(p => ({
    //     role: p.chatAsisten ? "assistant" as const : "user" as const,
    //     content: p.pesan,
    //   })),
    //   { role: "user" as const, content: dto.pesan },
    // ];

    // this.ragWorkerClient.tambahTugas(idChat, history);

    // res.status(200).json({
    //   idChat: idChat.toString(),
    //   pesan: {
    //     id: pesanKaryawan.id.toString(),
    //     pesan: pesanKaryawan.pesan,
    //     tanggalDibuat: pesanKaryawan.tanggalDibuat,
    //     lampiran,
    //   },
    // });
  }

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

  async getDetailChat(req: Request, res: Response): Promise<void> {
    const idPembuat = req.sesiPengguna!.idPengguna!;
    const idChat = BigInt(req.params.id);

    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat || chat.idPembuat !== idPembuat) {
      res.status(404).json({ error: "not_found", message: "Chat tidak ditemukan." });
      return;
    }

    const pesan = await this.repositoriChat.getHistoriPesan(idChat);

    // Batch-fetch semua lampiran untuk semua pesan sekaligus
    const pesanIds = pesan.map(p => p.id);
    const lampiranMap = pesanIds.length > 0
      ? await this.repositoriLampiran.getByIdPesanBatch("chat", pesanIds)
      : new Map();

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
        lampiran: (lampiranMap.get(p.id.toString()) ?? []).map(lampiranToDto),
      })),
    });
  }

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

    const koneksi = new KoneksiWsChat(ws, idChat, idSession);
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

  async listenPesanChatBaru(ws: WebSocket, idSession: string): Promise<string> {
    const koneksiWs = new KoneksiWsChat(ws, null, idSession);
    const idKoneksi = this.manajerWsChat.tambahKoneksiPesanBaru(koneksiWs);
    return idKoneksi;
  }
}
