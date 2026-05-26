import { PesanChat } from "./PesanChat.js";

export const parameterContohPesanChat = {
  id: 2n,
  idChat: 3n,
  pesan: "How to resolve paper jam?",
  tanggalDibuat: new Date(),
  chatAsisten: false,
  gagal: false,
};

export function buatContohPesanChat(): PesanChat {
  return new PesanChat(
    parameterContohPesanChat.id,
    parameterContohPesanChat.idChat,
    parameterContohPesanChat.pesan,
    parameterContohPesanChat.tanggalDibuat,
    parameterContohPesanChat.chatAsisten,
    parameterContohPesanChat.gagal,
  );
}
