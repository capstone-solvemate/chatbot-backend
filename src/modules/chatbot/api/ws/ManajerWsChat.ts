import type { WebSocket } from "ws";

import * as uuid from "uuid";

import type { WsErrorResponse } from "~/core/api/ws/dto/WsErrorResponse.js";
import type { WsContext } from "~/core/api/ws/types/WsContext.js";
import type { LogoutEventBus } from "~/modules/otentikasi/event/LogoutEventBus.js";

import { ApiErrorCodes } from "~/core/api/ApiErrorCodes.js";
import { ManajerWsWithAuth } from "~/core/api/ws/types/ManajerWsWithAuth.js";
import { errorToWsError } from "~/core/api/ws/WsErrorConverter.js";
import { TestGuard } from "~/core/test/TestGuard.js";
import { ForbiddenError } from "~/core/types/ForbiddenError.js";

import type { KontrolChat } from "../../application/KontrolChat.js";
import type { Chat } from "../../domain/Chat.js";
import type { PesanChat } from "../../domain/PesanChat.js";
import type { PayloadWsBuatChat } from "./dto/PayloadWsBuatChat.js";
import type { PayloadWsChatBaru } from "./dto/PayloadWsChatBaru.js";
import type { PayloadWsChatError } from "./dto/PayloadWsChatError.js";
import type { PayloadWsChatReady } from "./dto/PayloadWsChatReady.js";
import type { PayloadWsChatUpdate } from "./dto/PayloadWsChatUpdate.js";
import type { PayloadWsPesanChatLama } from "./dto/PayloadWsPesanChatLama.js";

import { validasiBalasChat } from "../../domain/Dto.js";
import { chatToPayloadWsChatBaru } from "./dto/ConverterPayloadChatBaru.js";
import { pesanChatToPayloadWsObjekPesanChat } from "./dto/ConverterPayloadWsObjekPesanChat.js";
import { daftarPesanChatToPayloadWsPesanChatLama } from "./dto/ConverterWsPesanChatLama.js";
import { TipePayloadWsChat } from "./dto/TipePayloadWsChat.js";
import { KoneksiWsChat } from "./KoneksiWsChat.js";

export class ManajerWsChat extends ManajerWsWithAuth {
  constructor(logoutEventBus: LogoutEventBus, private readonly kontrolChat: KontrolChat) {
    super(logoutEventBus);
  }

  private readonly koneksiByIdKoneksi = new Map<string, KoneksiWsChat>();
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

  tambahKoneksi(koneksiWs: KoneksiWsChat) {
    this.koneksiByIdKoneksi.set(koneksiWs.idKoneksi, koneksiWs);

    if (!this.koneksiByIdSession.get(koneksiWs.idSession)) {
      this.koneksiByIdSession.set(koneksiWs.idSession, new Map());
    }
    this.koneksiByIdSession.get(koneksiWs.idSession)!.set(koneksiWs.idKoneksi, koneksiWs);
  }

  private kirimPesanServerReady(ws: WebSocket) {
    const payload: PayloadWsChatReady = {
      tipe: TipePayloadWsChat.Ready,
    };
    ws.send(JSON.stringify(payload));
  }

  handleChatUpdate(idChat: string, sedangDiproses: boolean, dialihkanKeTiket: boolean, daftarPesan: PesanChat[], ws: WebSocket) {
    const payload: PayloadWsChatUpdate = {
      id: idChat,
      sedangDiproses,
      dialihkanKeTiket,
      pesan: daftarPesan.map(pesan => pesanChatToPayloadWsObjekPesanChat(pesan)),
      tipe: TipePayloadWsChat.ChatUpdate,
    };
    ws.send(JSON.stringify(payload));
  }

  handleChatBaru(chat: Chat, koneksiWs: KoneksiWsChat) {
    koneksiWs.idChat = chat.id;
    const payloadChat: PayloadWsChatBaru = chatToPayloadWsChatBaru(chat);
    koneksiWs.ws.send(JSON.stringify(payloadChat));
  }

  async handleBuatChat(payload: PayloadWsBuatChat, koneksiWs: KoneksiWsChat) {
    try {
      if (koneksiWs.idChat !== null) {
        throw new ForbiddenError();
      }
      validasiBalasChat(payload);
      await this.kontrolChat.buatChat(koneksiWs.idKoneksi, koneksiWs.idPengguna, payload.pesan, payload.daftarLampiran);
    }
    catch (e) {
      const { error } = errorToWsError(e);
      const payload: PayloadWsChatError = {
        tipe: TipePayloadWsChat.Error,
        error: error.error,
        message: error.message,
      };
      koneksiWs.ws.send(JSON.stringify(payload));
    }
  }

  async handleBuatPesanChat(payload: PayloadWsBuatChat, koneksiWs: KoneksiWsChat) {
    try {
      if (koneksiWs.idChat === null) {
        throw new ForbiddenError();
      }
      validasiBalasChat(payload as PayloadWsBuatChat);
      await this.kontrolChat.balasChat(koneksiWs.idChat!, koneksiWs.idPengguna, payload.pesan, payload.daftarLampiran);
    }
    catch (e) {
      const { error } = errorToWsError(e);
      const payload: PayloadWsChatError = {
        tipe: TipePayloadWsChat.Error,
        error: error.error,
        message: error.message,
      };
      koneksiWs.ws.send(JSON.stringify(payload));
    }
  }

  async handleGetDaftarPesanChatLama(koneksiWs: KoneksiWsChat) {
    try {
      const daftarPesanLama = await this.kontrolChat.getDaftarPesanChatLama(koneksiWs.idChat!);
      const payload: PayloadWsPesanChatLama = daftarPesanChatToPayloadWsPesanChatLama(daftarPesanLama);
      koneksiWs.ws.send(JSON.stringify(payload));
    }
    catch (e) {
      const { error } = errorToWsError(e);
      const payload: PayloadWsChatError = {
        tipe: TipePayloadWsChat.Error,
        error: error.error,
        message: error.message,
      };
      koneksiWs.ws.send(JSON.stringify(payload));
    }
  }

  async handlePesanClient(payload: Record<string, any>, koneksiWs: KoneksiWsChat) {
    switch (Number(payload.tipe)) {
      case TipePayloadWsChat.GetDaftarChatLama:
        await this.handleGetDaftarPesanChatLama(koneksiWs);
        break;
      case TipePayloadWsChat.BuatPesan:
        await this.handleBuatPesanChat(payload as PayloadWsBuatChat, koneksiWs);
        break;
      case TipePayloadWsChat.BuatChat:
        await this.handleBuatChat(payload as PayloadWsBuatChat, koneksiWs);
        break;
      default:
        console.warn("cannot understand client chat websocket message");
    }
  }

  async listenChatBaru(ws: WebSocket, wsContext: WsContext) {
    try {
      const koneksiWs = new KoneksiWsChat(ws, null, wsContext.sesiPengguna!.sessionId!, wsContext.sesiPengguna!.idPengguna!);

      const idListener = await this.kontrolChat.listenChatBaru(
        chat => this.handleChatBaru(chat, koneksiWs),
        (sedangDiproses, dialihkanKeTiket, daftarPesan) => this.handleChatUpdate(
          koneksiWs.idChat?.toString() ?? "0",
          sedangDiproses,
          dialihkanKeTiket,
          daftarPesan,
          ws,
        ),
      );

      koneksiWs.idKoneksi = idListener;
      this.tambahKoneksi(koneksiWs);

      ws.on("close", () => {
        this.kontrolChat.unlistenChat(idListener);
      });
      ws.on("message", (message) => {
        this.handlePesanClient(JSON.parse(message.toString()), koneksiWs);
      });

      this.kirimPesanServerReady(ws);
    }
    catch (e: any) {
      const { status, error } = errorToWsError(e);
      ws.close(status, JSON.stringify(error));
    }
  }

  async listenChatLama(ws: WebSocket, idChat: bigint, wsContext: WsContext) {
    try {
      const idListener = await this.kontrolChat.listenChatLama(
        idChat,
        wsContext.sesiPengguna!.idPengguna!,
        (sedangDiproses, dialihkanKeTiket, daftarPesan) => this.handleChatUpdate(
          idChat.toString(),
          sedangDiproses,
          dialihkanKeTiket,
          daftarPesan,
          ws,
        ),
      );

      const koneksiWs = new KoneksiWsChat(ws, idChat, wsContext.sesiPengguna!.sessionId!, wsContext.sesiPengguna!.idPengguna!, idListener);
      this.tambahKoneksi(koneksiWs);

      ws.on("close", () => {
        this.kontrolChat.unlistenChat(idListener);
      });
      ws.on("message", (message) => {
        this.handlePesanClient(JSON.parse(message.toString()), koneksiWs);
      });

      this.kirimPesanServerReady(ws);
    }
    catch (e: any) {
      const { status, error } = errorToWsError(e);
      ws.close(status, JSON.stringify(error));
    }
  }

  hapusByIdSession(idSession: string) {
    const mapKoneksiByIdSession = this.koneksiByIdSession.get(idSession);
    if (mapKoneksiByIdSession === undefined) {
      return;
    }

    for (const koneksi of mapKoneksiByIdSession.values()) {
      this.koneksiByIdKoneksi.delete(koneksi.idKoneksi);
    }

    this.koneksiByIdSession.delete(idSession);
  }

  hapusByIdKoneksi(id: string) {
    const koneksi = this.koneksiByIdKoneksi.get(id);
    if (koneksi) {
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
}
