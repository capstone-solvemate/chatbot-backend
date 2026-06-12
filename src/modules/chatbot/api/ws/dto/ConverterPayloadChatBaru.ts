import type { Chat } from "~/modules/chatbot/domain/Chat.js";

import type { PayloadWsChatBaru } from "./PayloadWsChatBaru.js";

import { TipePayloadWsChat } from "./TipePayloadWsChat.js";

export function chatToPayloadWsChatBaru(chat: Chat): PayloadWsChatBaru {
  return {
    id: chat.id.toString(),
    idPembuat: chat.idPembuat,
    dialihkanKeTiket: chat.dialihkanKeTiket,
    sedangDiproses: chat.sedangDiproses,
    subjek: chat.subjek,
    tanggalDibuat: chat.tanggalDibuat.toISOString(),
    pesan: chat.pesan.map(pesanChat => ({
      id: pesanChat.id.toString(),
      gagal: pesanChat.gagal,
      chatAsisten: pesanChat.chatAsisten,
      tanggalDibuat: pesanChat.tanggalDibuat.toISOString(),
      pesan: pesanChat.pesan,
      lampiran: pesanChat.lampiran.map(lampiran => ({
        id: lampiran.id.toString(),
      })),
    })),
    tipe: TipePayloadWsChat.ChatBaru,
  };
};
