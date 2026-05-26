import { LampiranPesanChat } from "./LampiranPesanChat.js";

export const parameterContohLampiranPesanChat = {
  id: 3n,
  idPesanChat: 3n,
  namaBerkas: "test.pdf",
  path: "/test.pdf",
  ukuran: 10n,
};

export function buatContohLampiranPesanChat(): LampiranPesanChat {
  const {
    id,
    idPesanChat,
    namaBerkas,
    path,
    ukuran,
  } = parameterContohLampiranPesanChat;
  return new LampiranPesanChat(
    id,
    idPesanChat,
    namaBerkas,
    path,
    ukuran,
  );
}
