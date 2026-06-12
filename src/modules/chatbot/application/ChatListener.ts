import type { PesanChat } from "../domain/PesanChat.js";

export class ChatListener {
  constructor(
    public id: string,
    public idChat: bigint | null,
    public onChatUpdate: (sedangDiproses: boolean, dialihkanKeTiket: boolean, daftarPesan: PesanChat[]) => void,
  ) {}
};
