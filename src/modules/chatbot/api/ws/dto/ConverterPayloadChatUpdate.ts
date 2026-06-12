import type { Chat } from "~/modules/chatbot/domain/Chat.js";

import type { PayloadWsChatUpdate } from "./PayloadWsChatUpdate.js";

import { pesanChatToPayloadWsObjekPesanChat } from "./ConverterPayloadWsObjekPesanChat.js";
import { TipePayloadWsChat } from "./TipePayloadWsChat.js";

export function chatToPayloadWsChatUpdate(chat: Chat): PayloadWsChatUpdate {
  return {
    id: chat.id.toString(),
    dialihkanKeTiket: chat.dialihkanKeTiket,
    sedangDiproses: chat.sedangDiproses,
    pesan: chat.pesan.map(pesanChat => pesanChatToPayloadWsObjekPesanChat(pesanChat)),
    tipe: TipePayloadWsChat.ChatUpdate,
  };
};
