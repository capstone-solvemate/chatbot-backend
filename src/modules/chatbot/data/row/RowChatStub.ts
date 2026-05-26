import type { RowChat } from "./RowChat.js";

import { parameterContohChat } from "../../domain/ChatStub.js";

export function buatContohRowChat(): RowChat {
  return {
    id: parameterContohChat.id,
    id_pembuat: parameterContohChat.idPembuat,
    tanggal_dibuat: parameterContohChat.tanggalDibuat,
    subjek: parameterContohChat.subjek,
    sedang_diproses: parameterContohChat.sedangDiproses,
    dialihkan_ke_tiket: parameterContohChat.dialihkanKeTiket,
  };
}
