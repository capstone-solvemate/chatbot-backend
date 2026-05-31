import type { LampiranPesanChat } from "./LampiranPesanChat.js";

export class PesanChat {
  constructor(
    public id: bigint,
    public readonly idChat: bigint,
    public readonly pesan: string,
    public readonly tanggalDibuat: Date,
    public readonly chatAsisten: boolean,
    public readonly gagal: boolean,
    public readonly lampiran: LampiranPesanChat[] = [],
  ) {}

  tambahLampiran(pLampiran: LampiranPesanChat) {
    this.lampiran.push(pLampiran);
  }
}
