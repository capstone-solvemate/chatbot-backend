import type { Request, Response } from "express";
import type WebSocket from "ws";

import * as uuid from "uuid";

import { ConflictError } from "~/core/types/ConflictError.js";
import { DataNotFoundError } from "~/core/types/DataNotFoundError.js";
import { ForbiddenError } from "~/core/types/ForbiddenError.js";

import type { RepositoriLampiran } from "../../upload/data/RepositoriLampiran.js";
import type { RepositoriChat } from "../data/RepositoriChat.js";
import type { ChatEventBus } from "../event/ChatEventBus.js";
import type { ChatListener } from "./ChatListener.js";
import type { RagWorkerClient } from "./RagWorkerClient.js";

import { lampiranToDto } from "../../upload/domain/Lampiran.js";
import { Chat, CHAT_ENTITY_NAME } from "../domain/Chat.js";
import { PesanChat } from "../domain/PesanChat.js";

export class KontrolChat {
  constructor(
    private readonly repositoriChat: RepositoriChat,
    private readonly ragWorkerClient: RagWorkerClient,
    private readonly chatEventBus: ChatEventBus,
    private readonly repositoriLampiran: RepositoriLampiran,
  ) {
    this.selesaikanChatYangTerputus();

    ragWorkerClient.setCallbackHasilSiap((idChat: bigint, pesan: string) => {
      this.handleHasilRagSiap(idChat, pesan);
    });
  }

  private daftarChatListener = new Map<string, ChatListener>();
  private daftarChatListenerByIdChat = new Map<bigint, Map<string, ChatListener>>();

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

  private setIdChatListener(idListener: string, idChat: bigint) {
    const listener = this.daftarChatListener.get(idListener);
    if (listener) {
      listener.idChat = idChat;

      if (!this.daftarChatListenerByIdChat.get(idChat)) {
        this.daftarChatListenerByIdChat.set(idChat, new Map());
      }
      this.daftarChatListenerByIdChat.get(idChat)!.set(idListener, listener);
    }
  }

  async buatChat(idListener: string, idPengguna: number, pesan: string, daftarLampiran: string[]): Promise<void> {
    // const daftarLampiran = payload.daftarLampiran;
    // for (let i = 0; i < lampiran.length; i++) {
    //   await validasiDimensiGambar(lampiran[i], i);
    // }

    const subjekChat = pesan.length > 50
      ? `${pesan.substring(0, 47)}...`
      : pesan;
    const chat = new Chat(0n, idPengguna, new Date(), subjekChat, true, false);
    await this.repositoriChat.buatChat(chat);

    const pesanChatKaryawan = new PesanChat(0n, chat.id, pesan, chat.tanggalDibuat, false, false);
    await this.repositoriChat.buatPesanChat(pesanChatKaryawan);

    chat.tambahPesan(pesanChatKaryawan);

    // for (const file of lampiran) {
    //   const lampiranPesanChat = new LampiranPesanChat(
    //     0n,
    //     pesanChatKaryawan.id,
    //     file.originalname,
    //     BigInt(file.size),
    //   );

    //   await this.repositoriChat.buatLampiranPesanChat(lampiranPesanChat, file);

    //   pesanChatKaryawan.tambahLampiran(lampiranPesanChat);
    // }

    this.setIdChatListener(idListener, chat.id);

    this.chatEventBus.emit("chat_dibuat", {
      idChat: chat.id,
      idPembuat: idPengguna,
      subjek: chat.subjek,
      tanggalDibuat: chat.tanggalDibuat,
    });

    const listener = this.daftarChatListener.get(idListener);
    if (listener) {
      listener.onChatBaru(chat);
    }

    this.ragWorkerClient.tambahTugas(chat.id, [
      { role: "user", content: pesan },
    ]);
  }

  async balasChat(idChat: bigint, idPengguna: number, pesan: string, daftarLampiran: string[]): Promise<void> {
    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat) {
      throw new DataNotFoundError(CHAT_ENTITY_NAME);
    }

    if (chat.idPembuat !== idPengguna) {
      throw new ForbiddenError();
    }

    if (chat.dialihkanKeTiket) {
      throw new ConflictError("This chat has been escalated to a support ticket.");
    }

    if (chat.sedangDiproses) {
      throw new ConflictError("Your previous chat message is pending.");
    }

    const historiPesan = await this.repositoriChat.getHistoriPesan(idChat);

    const pesanChatKaryawan = new PesanChat(0n, idChat, pesan, new Date(), false, false, []);
    await this.repositoriChat.buatPesanChat(pesanChatKaryawan);

    await this.repositoriChat.mulaiProsesChat(idChat);

    const daftarListenerTerkait = this.daftarChatListenerByIdChat.get(idChat);
    if (daftarListenerTerkait) {
      for (const listener of daftarListenerTerkait.values()) {
        listener.onChatUpdate(true, false, [pesanChatKaryawan]);
      }
    }

    // Simpan lampiran langsung dari form-data (jika ada)
    // const lampiran = await simpanFileDariRequest(
    //   req,
    //   idPengguna,
    //   pesanKaryawan.id,
    //   "chat",
    //   this.repositoriLampiran,
    // );

    this.chatEventBus.emit("pesan_baru", {
      idChat,
      idPembuat: idPengguna,
      tanggalDibuat: pesanChatKaryawan.tanggalDibuat,
    });

    const history = [
      ...historiPesan.map(p => ({
        role: p.chatAsisten ? "assistant" as const : "user" as const,
        content: p.pesan,
      })),
      { role: "user" as const, content: pesan },
    ];

    this.ragWorkerClient.tambahTugas(idChat, history);
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
    // const pesanIds = pesan.map(p => p.id);
    // const lampiranMap = pesanIds.length > 0
    //   ? await this.repositoriLampiran.getByIdPesanBatch("chat", pesanIds)
    //   : new Map();

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
        lampiran: [],
        // lampiran: (lampiranMap.get(p.id.toString()) ?? []).map(lampiranToDto),
      })),
    });
  }

  async handleWsConnect(
    ws: WebSocket,
    idChat: bigint,
    idPembuat: number,
    idSession: string,
  ): Promise<void> {
    // const chat = await this.repositoriChat.getChatById(idChat);
    // if (!chat || chat.idPembuat !== idPembuat) {
    //   ws.close(4004, "Chat tidak ditemukan");
    //   return;
    // }

    // const koneksi = new KoneksiWsChat(ws, idChat, idSession, idPembuat, async () => {});
    // this.manajerWsChat.tambah(koneksi);

    // ws.on("close", () => {
    //   this.manajerWsChat.hapus(koneksi);
    // });

    // ws.on("error", (err) => {
    //   console.error(
    //     new Date().toISOString(),
    //     `[KontrolChat] WS error idChat=${idChat}:`,
    //     err.message,
    //   );
    //   this.manajerWsChat.hapus(koneksi);
    // });
  }

  async handleHasilRagSiap(idChat: bigint, pesan: string) {
    const pesanChatAsisten = new PesanChat(0n, idChat, pesan, new Date(), true, false, []);
    await this.repositoriChat.buatPesanChat(pesanChatAsisten);
    await this.repositoriChat.selesaiProsesChat(idChat);

    const chat = await this.repositoriChat.getChatById(idChat);
    if (chat) {
      this.chatEventBus.emit("pesan_baru", {
        idChat,
        idPembuat: chat.idPembuat,
        tanggalDibuat: pesanChatAsisten.tanggalDibuat,
      });
    }

    const daftarListenerTerkait = this.daftarChatListenerByIdChat.get(idChat);
    if (daftarListenerTerkait) {
      for (const listener of daftarListenerTerkait.values()) {
        listener.onChatUpdate(false, false, [pesanChatAsisten]);
      }
    }
  }

  private generateIdListener(): string {
    let idBaru = "";
    do {
      idBaru = uuid.v4().toString();
    } while (this.daftarChatListener.has(idBaru));
    return idBaru;
  }

  private tambahChatListener(listener: ChatListener): string {
    const idBaru = this.generateIdListener();
    listener.id = idBaru;
    this.daftarChatListener.set(idBaru, listener);

    if (listener.idChat !== null) {
      if (!this.daftarChatListenerByIdChat.get(listener.idChat!)) {
        this.daftarChatListenerByIdChat.set(listener.idChat!, new Map());
      }
      this.daftarChatListenerByIdChat.get(listener.idChat!)!.set(listener.id, listener);
    }

    return idBaru;
  }

  async getDaftarPesanChatLama(idChat: bigint): Promise<PesanChat[]> {
    return await this.repositoriChat.getHistoriPesan(idChat);
  }

  async listenChatBaru(onChatBaru: (chat: Chat) => void, onChatUpdate: (sedangDiproses: boolean, dialihkanKeTiket: boolean, daftarPesan: PesanChat[]) => void): Promise<string> {
    const chatListener: ChatListener = {
      id: "",
      idChat: null,
      onChatBaru,
      onChatUpdate,
    };
    const idListener = this.tambahChatListener(chatListener);
    return idListener;
  }

  async listenChatLama(idChat: bigint, idPengguna: number, onChatUpdate: (sedangDiproses: boolean, dialihkanKeTiket: boolean, daftarPesan: PesanChat[]) => void): Promise<string> {
    const chat = await this.repositoriChat.getChatById(idChat);
    if (!chat) {
      throw new DataNotFoundError(CHAT_ENTITY_NAME);
    }

    if (chat.idPembuat !== idPengguna) {
      throw new ForbiddenError();
    }

    const chatListener: ChatListener = {
      id: "",
      idChat,
      onChatBaru: () => {},
      onChatUpdate,
    };
    const idListener = this.tambahChatListener(chatListener);

    return idListener;
  }

  unlistenChat(idListener: string) {
    const listener = this.daftarChatListener.get(idListener);
    if (!listener) {
      return;
    }
    this.daftarChatListener.delete(idListener);

    if (listener.idChat !== null) {
      const daftarListenerTerkait = this.daftarChatListenerByIdChat.get(listener.idChat);
      if (daftarListenerTerkait) {
        daftarListenerTerkait.delete(idListener);

        if (daftarListenerTerkait.size === 0) {
          this.daftarChatListenerByIdChat.delete(listener.idChat);
        }
      }
    }
  }
}
