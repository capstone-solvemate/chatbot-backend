import type { IWsSessionHandler } from "~/core/ws/IWsSessionHandler.js";

import type { KoneksiChat } from "../domain/KoneksiChat.js";

/**
 * ChatWsManager — mengelola koneksi WebSocket aktif dengan dual-index:
 * - byChat: untuk broadcast jawaban RAG ke semua tab dengan idChat yang sama
 * - bySession: untuk invalidasi semua koneksi saat logout
 */
export class ChatWsManager implements IWsSessionHandler {
  private constructor() {}
  static readonly instance = new ChatWsManager();

  private readonly byChat = new Map<bigint, Set<KoneksiChat>>();
  private readonly bySession = new Map<string, Set<KoneksiChat>>();

  tambah(koneksi: KoneksiChat): void {
    // Index by idChat
    if (!this.byChat.has(koneksi.idChat)) {
      this.byChat.set(koneksi.idChat, new Set());
    }
    this.byChat.get(koneksi.idChat)!.add(koneksi);

    // Index by idSession
    if (!this.bySession.has(koneksi.idSession)) {
      this.bySession.set(koneksi.idSession, new Set());
    }
    this.bySession.get(koneksi.idSession)!.add(koneksi);
  }

  hapus(koneksi: KoneksiChat): void {
    // Hapus dari index idChat
    const setChat = this.byChat.get(koneksi.idChat);
    if (setChat) {
      setChat.delete(koneksi);
      if (setChat.size === 0) {
        this.byChat.delete(koneksi.idChat);
      }
    }

    // Hapus dari index idSession
    const setSession = this.bySession.get(koneksi.idSession);
    if (setSession) {
      setSession.delete(koneksi);
      if (setSession.size === 0) {
        this.bySession.delete(koneksi.idSession);
      }
    }
  }

  broadcast(idChat: bigint, pesan: object): void {
    const koneksiSet = this.byChat.get(idChat);
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
    const koneksiSet = this.bySession.get(idSession);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify({ type: "session_expired" });
    for (const koneksi of koneksiSet) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
        koneksi.ws.close();
      }
      // Hapus dari index idChat
      const setChat = this.byChat.get(koneksi.idChat);
      if (setChat) {
        setChat.delete(koneksi);
        if (setChat.size === 0) {
          this.byChat.delete(koneksi.idChat);
        }
      }
    }

    this.bySession.delete(idSession);
  }
}
