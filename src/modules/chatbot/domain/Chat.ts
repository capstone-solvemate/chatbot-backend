import type { PesanChat } from "./PesanChat.js";

export class Chat {
  constructor(
    public id: bigint,
    public readonly idPembuat: number,
    public readonly tanggalDibuat: Date,
    public readonly subjek: string,
    public readonly sedangDiproses: boolean,
    public readonly dialihkanKeTiket: boolean,
    public readonly pesan: PesanChat[] = [],
  ) {
    if (subjek.length > 50) {
      throw new Error(`Panjang 'subjek' pada class 'Chat' harus kurang dari 50. Panjang terdeteksi: ${subjek.length}.`);
    }
  }

  tambahPesan(pesan: PesanChat) {
    this.pesan.push(pesan);
  }
}
