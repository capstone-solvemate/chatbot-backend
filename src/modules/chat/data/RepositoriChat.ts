import type { Model, ModelStatic } from "sequelize";

import { Op } from "sequelize";

import { TestGuard } from "~/core/test/TestGuard.js";

import { Chat } from "../domain/Chat.js";
import { PesanChat } from "../domain/PesanChat.js";

type ModelChat = ModelStatic<Model>;
type ModelPesanChat = ModelStatic<Model>;

export class RepositoriChat {
  constructor(
    private readonly modelChat: ModelChat,
    private readonly modelPesanChat: ModelPesanChat,
  ) {}

  // --- Helper ---

  private rowKeChat(c: Model): Chat {
    return new Chat(
      BigInt(c.getDataValue("id")),
      c.getDataValue("id_pembuat"),
      c.getDataValue("tanggal_dibuat"),
      c.getDataValue("subjek"),
      c.getDataValue("sedang_diproses"),
      c.getDataValue("dialihkan_ke_tiket"),
    );
  }

  private rowKePesanChat(p: Model): PesanChat {
    return new PesanChat(
      BigInt(p.getDataValue("id")),
      BigInt(p.getDataValue("id_chat")),
      p.getDataValue("pesan"),
      p.getDataValue("tanggal_dibuat"),
      p.getDataValue("chat_asisten"),
      p.getDataValue("gagal"),
    );
  }

  private chatKeRow(chat: Chat): Record<string, any> {
    return {
      id: chat.id,
      id_pembuat: chat.idPembuat,
      tanggal_dibuat: chat.tanggalDibuat,
      subjek: chat.subjek,
      sedang_diproses: chat.sedangDiproses,
      dialihkan_ke_tiket: chat.dialihkanKeTiket,
    };
  }

  testChatKeRow(chat: Chat): Record<string, any> {
    TestGuard.ensureInTestMode();
    return this.chatKeRow(chat);
  }

  // --- Chat ---

  async buatChat(idPembuat: number, subjek: string): Promise<Chat> {
    const chat = await this.modelChat.create({
      id_pembuat: idPembuat,
      subjek,
      sedang_diproses: false,
      diproses_sejak: null,
      dialihkan_ke_tiket: false,
    });
    return this.rowKeChat(chat);
  }

  async getChatById(id: bigint): Promise<Chat | null> {
    const chat = await this.modelChat.findByPk(id.toString());
    if (!chat)
      return null;
    return this.rowKeChat(chat);
  }

  async getSemuaChatPengguna(idPembuat: number): Promise<Chat[]> {
    const chats = await this.modelChat.findAll({
      where: { id_pembuat: idPembuat },
      order: [["tanggal_dibuat", "DESC"]],
    });
    return chats.map(c => this.rowKeChat(c));
  }

  /**
   * Set sedang_diproses = true.
   * Dipanggil oleh RagWorkerClient sebelum kirim tugas ke worker.
   */
  async mulaiProsesChat(idChat: bigint): Promise<void> {
    await this.modelChat.update(
      { sedang_diproses: true },
      { where: { id: idChat.toString() } },
    );
  }

  /**
   * Set sedang_diproses = false.
   * Dipanggil oleh RagWorkerClient setelah hasil diterima (ok maupun error).
   */
  async selesaiProsesChat(idChat: bigint): Promise<void> {
    await this.modelChat.update(
      { sedang_diproses: false },
      { where: { id: idChat.toString() } },
    );
  }

  /**
   * Dipanggil saat startup untuk memulihkan chat yang terputus akibat restart.
   * Semua chat dengan sedang_diproses = true akan:
   * - Direset sedang_diproses = false, diproses_sejak = null
   * - Pesan terakhir yang bukan dari asisten ditandai gagal = true
   *
   * Mengembalikan jumlah chat yang dipulihkan.
   */
  async pulihkanChatTerputus(): Promise<number> {
    // Cari semua idChat yang sedang_diproses = true
    const chatTerputus = await this.modelChat.findAll({
      where: { sedang_diproses: true },
      attributes: ["id"],
    });

    if (chatTerputus.length === 0)
      return 0;

    const idChatList = chatTerputus.map(c => c.getDataValue("id").toString());

    // Tandai pesan terakhir user yang belum dibalas asisten sebagai gagal
    for (const idChat of idChatList) {
      await this.tandaiPesanTerakhirGagal(BigInt(idChat));
    }

    // Reset semua chat terputus sekaligus
    await this.modelChat.update(
      { sedang_diproses: false },
      { where: { id: { [Op.in]: idChatList } } },
    );

    return chatTerputus.length;
  }

  // --- PesanChat ---

  /**
   * Tandai pesan terakhir dari user (bukan asisten) sebagai gagal.
   * Dipanggil oleh RagWorkerClient saat RAG mengembalikan error.
   */
  async tandaiPesanTerakhirGagal(idChat: bigint): Promise<void> {
    const pesanTerakhir = await this.modelPesanChat.findOne({
      where: {
        id_chat: idChat.toString(),
        chat_asisten: false,
        gagal: false,
      },
      order: [["tanggal_dibuat", "DESC"]],
    });

    if (!pesanTerakhir)
      return;

    const adaBalasanAsisten = await this.modelPesanChat.findOne({
      where: {
        id_chat: idChat.toString(),
        chat_asisten: true,
        tanggal_dibuat: {
          [Op.gt]: pesanTerakhir.getDataValue("tanggal_dibuat"),
        },
      },
    });

    if (!adaBalasanAsisten) {
      await this.modelPesanChat.update(
        { gagal: true },
        { where: { id: pesanTerakhir.getDataValue("id") } },
      );
    }
  }

  async tambahPesanChat(idChat: bigint, pesan: string, chatAsisten: boolean): Promise<PesanChat> {
    const pesanChat = await this.modelPesanChat.create({
      id_chat: idChat,
      pesan,
      chat_asisten: chatAsisten,
      gagal: false,
    });
    return this.rowKePesanChat(pesanChat);
  }

  async getHistoriPesan(idChat: bigint): Promise<PesanChat[]> {
    const pesanChats = await this.modelPesanChat.findAll({
      where: { id_chat: idChat.toString() },
      order: [["tanggal_dibuat", "ASC"]],
    });
    return pesanChats.map(p => this.rowKePesanChat(p));
  }
}
