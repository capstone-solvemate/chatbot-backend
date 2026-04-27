import { ModelChat } from "~/models/ModelChat.js";
import { ModelPesanChat } from "~/models/ModelPesanChat.js";

import { Chat } from "../domain/Chat.js";
import { PesanChat } from "../domain/PesanChat.js";

export class RepositoriChat {
  private constructor() {}
  static readonly instance = new RepositoriChat();

  async buatChat(idPembuat: number, subjek: string): Promise<Chat> {
    const chat = await ModelChat.create({
      id_pembuat: idPembuat,
      subjek,
    });
    return new Chat(
      BigInt(chat.getDataValue("id")),
      chat.getDataValue("id_pembuat"),
      chat.getDataValue("tanggal_dibuat"),
      chat.getDataValue("subjek")
    );
  }

  async tambahPesanChat(idChat: bigint, pesan: string, chatAsisten: boolean): Promise<PesanChat> {
    const pesanChat = await ModelPesanChat.create({
      id_chat: idChat,
      pesan,
      chat_asisten: chatAsisten,
    });
    return new PesanChat(
      BigInt(pesanChat.getDataValue("id")),
      BigInt(pesanChat.getDataValue("id_chat")),
      pesanChat.getDataValue("pesan"),
      pesanChat.getDataValue("tanggal_dibuat"),
      pesanChat.getDataValue("chat_asisten")
    );
  }

  async getChatById(id: bigint): Promise<Chat | null> {
    const chat = await ModelChat.findByPk(id.toString());
    if (!chat) return null;
    return new Chat(
      BigInt(chat.getDataValue("id")),
      chat.getDataValue("id_pembuat"),
      chat.getDataValue("tanggal_dibuat"),
      chat.getDataValue("subjek")
    );
  }

  async getSemuaChatPengguna(idPembuat: number): Promise<Chat[]> {
    const chats = await ModelChat.findAll({
      where: { id_pembuat: idPembuat },
      order: [["tanggal_dibuat", "DESC"]],
    });
    return chats.map(c => new Chat(
      BigInt(c.getDataValue("id")),
      c.getDataValue("id_pembuat"),
      c.getDataValue("tanggal_dibuat"),
      c.getDataValue("subjek")
    ));
  }

  async getHistoriPesan(idChat: bigint): Promise<PesanChat[]> {
    const pesanChats = await ModelPesanChat.findAll({
      where: { id_chat: idChat.toString() },
      order: [["tanggal_dibuat", "ASC"]],
    });
    return pesanChats.map(p => new PesanChat(
      BigInt(p.getDataValue("id")),
      BigInt(p.getDataValue("id_chat")),
      p.getDataValue("pesan"),
      p.getDataValue("tanggal_dibuat"),
      p.getDataValue("chat_asisten")
    ));
  }
}
