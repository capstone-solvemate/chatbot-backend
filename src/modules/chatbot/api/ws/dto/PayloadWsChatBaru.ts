import type { PayloadWsChat } from "./PayloadWsChat.js";

export type PayloadWsChatBaru = {
  id: string;
  idPembuat: number;
  tanggalDibuat: string;
  subjek: string;
  sedangDiproses: boolean;
  dialihkanKeTiket: boolean;
  pesan: {
    id: string;
    pesan: string;
    tanggalDibuat: string;
    chatAsisten: boolean;
    gagal: boolean;
    lampiran: {
      id: string;
    }[];
  }[];
} & PayloadWsChat;
