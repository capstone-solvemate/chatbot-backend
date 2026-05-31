import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import * as uuid from "uuid";

import type { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { TestGuard } from "~/core/test/TestGuard.js";

import type { WsContext } from "./WsContext.js";

import { WsHandler } from "./WsHandler.js";

export class InjectSesiPenggunaWsForTest extends WsHandler {
  constructor(private peran: PeranPengguna) {
    TestGuard.ensureInTestMode();
    super();
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    context.sesiPengguna = {
      idPengguna: 1,
      csrfToken: uuid.v4().toString(),
      peranPengguna: this.peran,
      sessionId: uuid.v4().toString(),
    };
  }
}
