import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { WsContext } from "~/core/api/ws/types/WsContext";

import { WsHandler } from "~/core/api/ws/types/WsHandler";

import type { KontrolChat } from "../../application/KontrolChat.js";
import type { PayloadIdKoneksiWsChat } from "./dto/PayloadIdKoneksiWsChat.js";

import { TipePayloadWsChat } from "./dto/TipePayloadWsChat.js";

export class WsHandlerListenChatBaru extends WsHandler {
  constructor(private kontrolChat: KontrolChat) {
    super();
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    const idKoneksi = await this.kontrolChat.listenPesanChatBaru(ws, context.sesiPengguna!.sessionId);

    const payload: PayloadIdKoneksiWsChat = {
      idKoneksi,
      tipe: TipePayloadWsChat.IdKoneksi,
    };
    ws.send(JSON.stringify(payload));
  }
}
