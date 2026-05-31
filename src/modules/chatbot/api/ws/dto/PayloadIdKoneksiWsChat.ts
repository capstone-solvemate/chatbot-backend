import type { PayloadWsChat } from "./PayloadWsChat.js";

export type PayloadIdKoneksiWsChat = {
  idKoneksi: string;
} & PayloadWsChat;
