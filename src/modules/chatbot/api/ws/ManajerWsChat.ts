import * as uuid from "uuid";

import type { WsErrorResponse } from "~/core/api/ws/dto/WsErrorResponse.js";

import { ApiErrorCodes } from "~/core/api/ApiErrorCodes.js";
import { ManajerWsWithAuth } from "~/core/api/ws/types/ManajerWsWithAuth.js";
import { TestGuard } from "~/core/test/TestGuard.js";

import type { KoneksiWsChat } from "./KoneksiWsChat.js";

export class ManajerWsChat extends ManajerWsWithAuth {
  private readonly koneksiByIdKoneksi = new Map<string, KoneksiWsChat>();
  private readonly koneksiByIdChat = new Map<bigint, Map<string, KoneksiWsChat>>();
  private readonly koneksiByIdSession = new Map<string, Map<string, KoneksiWsChat>>();

  private generateIdKoneksi(): string {
    let idKoneksi = "";
    do {
      idKoneksi = uuid.v4().toString();
    } while (this.koneksiByIdKoneksi.has(idKoneksi));

    return idKoneksi;
  }

  tambahKoneksiPesanBaru(koneksiWs: KoneksiWsChat): string {
    const idKoneksi = this.generateIdKoneksi();
    koneksiWs.idKoneksi = idKoneksi;

    this.koneksiByIdKoneksi.set(idKoneksi, koneksiWs);

    if (!this.koneksiByIdSession.has(koneksiWs.idSession)) {
      this.koneksiByIdSession.set(koneksiWs.idSession, new Map());
    }
    this.koneksiByIdSession.get(koneksiWs.idSession)!.set(koneksiWs.idKoneksi, koneksiWs);

    koneksiWs.ws.addEventListener("close", () => {
      this.hapusByIdKoneksi(koneksiWs.idKoneksi);
    });

    return idKoneksi;
  }

  setIdChat(idKoneksiWs: string, idSession: string, idChat: bigint) {
    const koneksi = this.koneksiByIdKoneksi.get(idKoneksiWs);
    if (koneksi && koneksi.idSession === idSession && koneksi.idChat === null) {
      koneksi.idChat = idChat;

      if (!this.koneksiByIdChat.get(idChat)) {
        this.koneksiByIdChat.set(idChat, new Map());
      }
      this.koneksiByIdChat.get(idChat)!.set(koneksi.idKoneksi, koneksi);
    }
  }

  getKoneksi(idKoneksiWs: string, idSession: string): KoneksiWsChat | null {
    const koneksi = this.koneksiByIdKoneksi.get(idKoneksiWs);
    if (!koneksi) {
      return null;
    }

    if (koneksi.idSession !== idSession) {
      return null;
    }

    return koneksi;
  }

  tambah(koneksi: KoneksiWsChat): void {
    // Index by idChat
    // if (!this.koneksiByChat.has(koneksi.idChat!)) {
    //   this.koneksiByChat.set(koneksi.idChat!, new Set());
    // }
    // this.koneksiByChat.get(koneksi.idChat!)!.add(koneksi);

    // // Index by idSession
    // if (!this.koneksiBySession.has(koneksi.idSession)) {
    //   this.koneksiBySession.set(koneksi.idSession, new Set());
    // }
    // this.koneksiBySession.get(koneksi.idSession)!.add(koneksi);
  }

  hapus(koneksi: KoneksiWsChat): void {
    // Hapus dari index idChat
    // const setChat = this.koneksiByChat.get(koneksi.idChat!);
    // if (setChat) {
    //   setChat.delete(koneksi);
    //   if (setChat.size === 0) {
    //     this.koneksiByChat.delete(koneksi.idChat!);
    //   }
    // }

    // // Hapus dari index idSession
    // const setSession = this.koneksiBySession.get(koneksi.idSession);
    // if (setSession) {
    //   setSession.delete(koneksi);
    //   if (setSession.size === 0) {
    //     this.koneksiBySession.delete(koneksi.idSession);
    //   }
    // }
  }

  hapusByIdSession(idSession: string) {
    const mapKoneksiByIdSession = this.koneksiByIdSession.get(idSession);
    if (mapKoneksiByIdSession === undefined) {
      return;
    }

    for (const koneksi of mapKoneksiByIdSession.values()) {
      this.koneksiByIdKoneksi.delete(koneksi.idKoneksi);

      if (koneksi.idChat !== null) {
        const mapKoneksiByIdChat = this.koneksiByIdChat.get(koneksi.idChat);
        if (mapKoneksiByIdChat !== undefined) {
          mapKoneksiByIdChat.delete(koneksi.idKoneksi);
          if (mapKoneksiByIdChat.size === 0) {
            this.koneksiByIdChat.delete(koneksi.idChat);
          }
        }
      }
    }

    this.koneksiByIdSession.delete(idSession);
  }

  hapusByIdKoneksi(id: string) {
    const koneksi = this.koneksiByIdKoneksi.get(id);
    if (koneksi) {
      if (koneksi.idChat !== null) {
        const mapKoneksiByChat = this.koneksiByIdChat.get(koneksi.idChat);
        if (mapKoneksiByChat !== undefined) {
          mapKoneksiByChat.delete(koneksi.idKoneksi);
          if (mapKoneksiByChat.size === 0) {
            this.koneksiByIdChat.delete(koneksi.idChat);
          }
        }
      }

      const mapKoneksiBySession = this.koneksiByIdSession.get(koneksi.idSession);
      if (mapKoneksiBySession !== undefined) {
        mapKoneksiBySession.delete(koneksi.idKoneksi);
        if (mapKoneksiBySession.size === 0) {
          this.koneksiByIdSession.delete(koneksi.idSession);
        }
      }

      this.koneksiByIdKoneksi.delete(id);
    }
  }

  broadcast(idChat: bigint, pesan: object): void {
    const koneksiSet = this.koneksiByIdChat.get(idChat);
    if (!koneksiSet)
      return;

    const payload = JSON.stringify(pesan);
    for (const koneksi of koneksiSet.values()) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.send(payload);
      }
    }
  }

  async handleLogout(idSession: string): Promise<void> {
    const mapKoneksi = this.koneksiByIdSession.get(idSession);
    if (mapKoneksi === undefined)
      return;

    const payload: WsErrorResponse = {
      error: ApiErrorCodes.Unauthenticated,
      message: "session expired",
    };

    for (const koneksi of mapKoneksi.values()) {
      if (koneksi.ws.readyState === koneksi.ws.OPEN) {
        koneksi.ws.close(4401, JSON.stringify(payload));
      }
    }

    this.hapusByIdSession(idSession);
  }

  testGetKoneksiByIdKoneksi(): Map<string, KoneksiWsChat> {
    TestGuard.ensureInTestMode();
    return this.koneksiByIdKoneksi;
  }

  testGetKoneksiByIdSession(): Map<string, Map<string, KoneksiWsChat>> {
    TestGuard.ensureInTestMode();
    return this.koneksiByIdSession;
  }

  testGetKoneksiByIdChat(): Map<bigint, Map<string, KoneksiWsChat>> {
    TestGuard.ensureInTestMode();
    return this.koneksiByIdChat;
  }
}
