import type { PayloadWsChat } from "./PayloadWsChat.js";
import type { PayloadWsObjekPesanChat } from "./PayloadWsObjekPesanChat.js";

export type PayloadWsChatUpdate = {
  id: string;
  sedangDiproses: boolean;
  dialihkanKeTiket: boolean;
  pesan: PayloadWsObjekPesanChat[];
} & PayloadWsChat;
