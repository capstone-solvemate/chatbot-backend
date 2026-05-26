import type { IWsSessionHandler } from "~/core/ws/IWsSessionHandler.js";

import type { KoneksiChat } from "../api/ws/KoneksiWsChat.js";

/**
 * ChatWsManager — mengelola koneksi WebSocket aktif dengan dual-index:
 * - byChat: untuk broadcast jawaban RAG ke semua tab dengan idChat yang sama
 * - bySession: untuk invalidasi semua koneksi saat logout
 */
export class ChatWsManager implements IWsSessionHandler {
  private constructor() {}
  static readonly instance = new ChatWsManager();

  private readonly koneksiChatBaru = new Map<string, Set<KoneksiChat>>();
  private readonly koneksiByChat = new Map<bigint, Set<KoneksiChat>>();
  private readonly koneksiBySession = new Map<string, Set<KoneksiChat>>();

  tambah(koneksi: KoneksiChat): void {
    // Index by idChat
    if (!this.koneksiByChat.has(koneksi.idChat)) {
      this.koneksiByChat.set(koneksi.idChat, new Set());
    }
    this.koneksiByChat.get(koneksi.idChat)!.add(koneksi);

    // Index by idSession
    if (!this.koneksiBySession.has(koneksi.idSession)) {
      this.koneksiBySession.set(koneksi.idSession, new Set());
    }
    this.koneksiBySession.get(koneksi.idSession)!.add(koneksi);
  }

  hapus(koneksi: KoneksiChat): void {
    // Hapus dari index idChat
    const setChat = this.koneksiByChat.get(koneksi.idChat);
    if (setChat) {
      setChat.delete(koneksi);
      if (setChat.size === 0) {
        this.koneksiByChat.delete(koneksi.idChat);
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

  /**
   * Dipanggil oleh WsSessionRegistry saat logout — kirim notifikasi
   * session_expired ke semua koneksi WS milik session tersebut, lalu tutup.
   */
  invalidasiSession(idSession: string): void {
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
      const setChat = this.koneksiByChat.get(koneksi.idChat);
      if (setChat) {
        setChat.delete(koneksi);
        if (setChat.size === 0) {
          this.koneksiByChat.delete(koneksi.idChat);
        }
      }
    }

    this.koneksiBySession.delete(idSession);
  }
}
