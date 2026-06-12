import type { PesanChat } from "~/modules/chatbot/domain/PesanChat.js";

import type { PayloadWsObjekPesanChat } from "./PayloadWsObjekPesanChat.js";

export function pesanChatToPayloadWsObjekPesanChat(pesanChat: PesanChat): PayloadWsObjekPesanChat {
  return {
    id: pesanChat.id.toString(),
    pesan: pesanChat.pesan,
    tanggalDibuat: pesanChat.tanggalDibuat.toISOString(),
    chatAsisten: pesanChat.chatAsisten,
    gagal: pesanChat.gagal,
    daftarLampiran: pesanChat.lampiran.map(lampiran => ({
      id: lampiran.id.toString(),
    })),
  };
}
