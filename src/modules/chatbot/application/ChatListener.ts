import type { Chat } from "../domain/Chat.js";
import type { PesanChat } from "../domain/PesanChat.js";

export class ChatListener {
  constructor(
    public id: string,
    public idChat: bigint | null,
    public onChatBaru: (chat: Chat) => void,
    public onChatUpdate: (sedangDiproses: boolean, dialihkanKeTiket: boolean, daftarPesan: PesanChat[]) => void,
  ) {}
};
