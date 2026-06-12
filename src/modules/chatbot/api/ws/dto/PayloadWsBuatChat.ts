import type { PayloadWsChat } from "./PayloadWsChat.js";

export type PayloadWsBuatChat = {
  pesan: string;
  daftarLampiran: string[];
} & PayloadWsChat;
