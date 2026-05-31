import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { ForbiddenError } from "~/core/types/ForbiddenError.js";
import { UnauthenticatedError, UnauthenticatedReason } from "~/core/types/UnauthenticatedError.js";

import type { WsContext } from "../types/WsContext.js";

import { WsHandler } from "../types/WsHandler.js";

class PeranMiddleware extends WsHandler {
  constructor(private peranDiizinkan: PeranPengguna[]) {
    super();
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    if (!context.sesiPengguna || context.sesiPengguna.peranPengguna === null) {
      throw new UnauthenticatedError(UnauthenticatedReason.InvalidToken);
    }

    if (!this.peranDiizinkan.includes(context.sesiPengguna.peranPengguna)) {
      throw new ForbiddenError();
    }
  }
}

export function peranMiddleware(peranDiizinkan: PeranPengguna[]): WsHandler {
  return new PeranMiddleware(peranDiizinkan);
}
