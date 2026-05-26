import type { Chat } from "../../domain/Chat.js";
import type { LampiranPesanChat } from "../../domain/LampiranPesanChat.js";
import type { PesanChat } from "../../domain/PesanChat.js";
import type { RowChat } from "./RowChat.js";
import type { RowLampiranPesanChat } from "./RowLampiranPesanChat.js";
import type { RowPesanChat } from "./RowPesanChat.js";

export class RowConverterChat {
  chatKeRow(chat: Chat): RowChat {
    return {
      id: chat.id,
      id_pembuat: chat.idPembuat,
      tanggal_dibuat: chat.tanggalDibuat,
      subjek: chat.subjek,
      sedang_diproses: chat.sedangDiproses,
      dialihkan_ke_tiket: chat.dialihkanKeTiket,
    };
  }

  pesanChatKeRow(pesanChat: PesanChat): RowPesanChat {
    return {
      id: pesanChat.id,
      id_chat: pesanChat.idChat,
      chat_asisten: pesanChat.chatAsisten,
      tanggal_dibuat: pesanChat.tanggalDibuat,
      gagal: pesanChat.gagal,
      pesan: pesanChat.pesan,
    };
  }

  lampiranPesanChatKeRow(lampiranPesanChat: LampiranPesanChat): RowLampiranPesanChat {
    return {
      id: lampiranPesanChat.id,
      id_pesan_chat: lampiranPesanChat.idPesanChat,
      nama_berkas: lampiranPesanChat.namaBerkas,
      path: lampiranPesanChat.path,
      ukuran: lampiranPesanChat.ukuran,
    };
  }
}
