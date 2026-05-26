import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { KontrolOtentikasi } from "~/modules/otentikasi/business/KontrolOtentikasi.js";

import { InvalidCsrfToken } from "~/core/types/InvalidCsrfTokenError.js";
import { UnauthenticatedError, UnauthenticatedReason } from "~/core/types/UnauthenticatedError.js";
import { DI } from "~/di/DI.js";

import type { WsContext } from "../types/WsContext.js";

import { WsHandler } from "../types/WsHandler.js";

class AuthMiddleware extends WsHandler {
  constructor(private kontrolOtentikasi: KontrolOtentikasi) {
    super();
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => c.trim().split("=").map(decodeURIComponent)),
    );

    const sessionId = cookies.session;

    if (!sessionId) {
      throw new InvalidCsrfToken();
    }

    const session = await this.kontrolOtentikasi.getSession(sessionId);
    if (!session) {
      throw new UnauthenticatedError(UnauthenticatedReason.InvalidToken);
    }

    context.sesiPengguna = {
      csrfToken: session.csrfToken,
      idPengguna: session.idPengguna,
      peranPengguna: session.peranPengguna,
      sessionId,
    };
  }
}

export function authMiddleware(): WsHandler {
  const kontrolOtentikasi = DI.provideKontrolOtentikasi();
  return new AuthMiddleware(kontrolOtentikasi);
}
