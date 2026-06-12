import type { PayloadWsChat } from "./PayloadWsChat.js";
import type { PayloadWsObjekPesanChat } from "./PayloadWsObjekPesanChat.js";

export type PayloadWsPesanChatLama = {
  daftarPesan: PayloadWsObjekPesanChat[];
} & PayloadWsChat;
