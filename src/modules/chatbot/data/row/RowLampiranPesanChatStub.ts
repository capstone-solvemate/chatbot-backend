import type { RowLampiranPesanChat } from "./RowLampiranPesanChat.js";

import { parameterContohLampiranPesanChat } from "../../domain/LampiranPesanChatStub.js";

export function buatContohRowLampiranPesanChat(): RowLampiranPesanChat {
  const { id, idPesanChat, namaBerkas, path, ukuran } = parameterContohLampiranPesanChat;
  return {
    id,
    id_pesan_chat: idPesanChat,
    nama_berkas: namaBerkas,
    path,
    ukuran,
  };
}
