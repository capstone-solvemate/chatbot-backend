import { Chat } from "./Chat.js";

export const parameterContohChat = {
  id: 3n,
  idPembuat: 8,
  tanggalDibuat: new Date("2024-06-20 05:00:00"),
  subjek: "How to resolve paper jam?",
  sedangDiproses: false,
  dialihkanKeTiket: true,
};

export function buatContohChat(): Chat {
  return new Chat(
    parameterContohChat.id,
    parameterContohChat.idPembuat,
    parameterContohChat.tanggalDibuat,
    parameterContohChat.subjek,
    parameterContohChat.sedangDiproses,
    parameterContohChat.dialihkanKeTiket,
  );
}
