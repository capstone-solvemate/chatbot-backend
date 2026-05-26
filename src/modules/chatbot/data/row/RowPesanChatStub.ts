import type { RowPesanChat } from "./RowPesanChat.js";

import { parameterContohPesanChat } from "../../domain/PesanChatStub.js";

export function buatContohRowPesanChat(): RowPesanChat {
  return {
    id: parameterContohPesanChat.id,
    id_chat: parameterContohPesanChat.idChat,
    gagal: parameterContohPesanChat.gagal,
    chat_asisten: parameterContohPesanChat.chatAsisten,
    pesan: parameterContohPesanChat.pesan,
    tanggal_dibuat: parameterContohPesanChat.tanggalDibuat,
  };
}
