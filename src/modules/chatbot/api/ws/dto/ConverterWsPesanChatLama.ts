import type { PesanChat } from "~/modules/chatbot/domain/PesanChat.js";

import type { PayloadWsPesanChatLama } from "./PayloadWsPesanChatLama.js";

import { pesanChatToPayloadWsObjekPesanChat } from "./ConverterPayloadWsObjekPesanChat.js";
import { TipePayloadWsChat } from "./TipePayloadWsChat.js";

export function daftarPesanChatToPayloadWsPesanChatLama(daftarPesanChat: PesanChat[]): PayloadWsPesanChatLama {
  return {
    tipe: TipePayloadWsChat.DaftarChatLama,
    daftarPesan: daftarPesanChat.map(pesanChat => pesanChatToPayloadWsObjekPesanChat(pesanChat)),
  };
}
