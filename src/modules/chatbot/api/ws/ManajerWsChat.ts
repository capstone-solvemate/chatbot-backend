import * as uuid from "uuid";

import { ManajerWsWithAuth } from "~/core/api/ws/types/ManajerWsWithAuth.js";

import type { KoneksiWsChat } from "./KoneksiWsChat.js";

export class ManajerWsChat extends ManajerWsWithAuth {
  private readonly koneksiChatById = new Map<string, KoneksiWsChat>();
  private readonly koneksiByChat = new Map<bigint, Set<KoneksiWsChat>>();
  private readonly koneksiBySession = new Map<string, Set<KoneksiWsChat>>();

  private generateIdKoneksi(): string {
    let idKoneksi = "";
    do {
      idKoneksi = uuid.v4().toString();
    } while (this.koneksiChatById.has(idKoneksi));

    return idKoneksi;
  }

  tambahKoneksiPesanBaru(koneksiWs: KoneksiWsChat): string {
    const idKoneksi = this.generateIdKoneksi();
    koneksiWs.idKoneksi = idKoneksi;

    this.koneksiChatById.set(idKoneksi, koneksiWs);

    if (!this.koneksiBySession.has(koneksiWs.idSession)) {
      this.koneksiBySession.set(koneksiWs.idSession, new Set());
    }
    this.koneksiBySession.get(koneksiWs.idSession)!.add(koneksiWs);

    return idKoneksi;
  }

  tambah(koneksi: KoneksiWsChat): void {
    // Index by idChat
    if (!this.koneksiByChat.has(koneksi.idChat!)) {
      this.koneksiByChat.set(koneksi.idChat!, new Set());
    }
    this.koneksiByChat.get(koneksi.idChat!)!.add(koneksi);

    // Index by idSession
    if (!this.koneksiBySession.has(koneksi.idSession)) {
      this.koneksiBySession.set(koneksi.idSession, new Set());
    }
    this.koneksiBySession.get(koneksi.idSession)!.add(koneksi);
  }

  hapus(koneksi: KoneksiWsChat): void {
    // Hapus dari index idChat
    const setChat = this.koneksiByChat.get(koneksi.idChat!);
    if (setChat) {
      setChat.delete(koneksi);
      if (setChat.size === 0) {
        this.koneksiByChat.delete(koneksi.idChat!);
      }
    }

    // Hapus dari index idSession
    const setSession = this.koneksiBySession.get(koneksi.idSession);
    if (setSession) {
      setSession.delete(koneksi);
      if (setSession.size === 0) {
        this.koneksiBySession.delete(koneksi.idSession);
      }
    }
  }

  broadcast(idChat: bigint, pesan: object): void {
    const koneksiSet = this.koneksiByChat.get(idChat);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify(pesan);
    for (const koneksi of koneksiSet) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
      }
    }
  }

  async handleLogout(idSession: string): Promise<void> {
    const koneksiSet = this.koneksiBySession.get(idSession);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify({ type: "session_expired" });
    for (const koneksi of koneksiSet) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
        koneksi.ws.close();
      }
      // Hapus dari index idChat
      const setChat = this.koneksiByChat.get(koneksi.idChat!);
      if (setChat) {
        setChat.delete(koneksi);
        if (setChat.size === 0) {
          this.koneksiByChat.delete(koneksi.idChat!);
        }
      }
    }

    this.koneksiBySession.delete(idSession);
  }
}
