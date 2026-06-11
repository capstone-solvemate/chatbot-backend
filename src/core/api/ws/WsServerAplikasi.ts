import type { Buffer } from "node:buffer";
import type { IncomingMessage, Server } from "node:http";
import type { Duplex } from "node:stream";
import type { WebSocket } from "ws";

import { WebSocketServer } from "ws";

import { handleChatbotMonitoringWsUpgrade, handleDashboardWsUpgrade } from "~/api/dashboard.js";
import { handleNotifikasiWsUpgrade } from "~/api/notifikasi.js";
import { ForbiddenError } from "~/core/types/ForbiddenError.js";
import { UnauthenticatedError, UnauthenticatedReason } from "~/core/types/UnauthenticatedError.js";

import type { WsErrorResponse } from "./dto/WsErrorResponse.js";
import type { WsContext } from "./types/WsContext.js";
import type { WsRouter } from "./types/WsRouter.js";

import { ApiErrorCodes } from "../ApiErrorCodes.js";

export class WsServerAplikasi {
  constructor(
    private router: WsRouter,
  ) {}

  jalankan(serverRest: Server): void {
    const wss = new WebSocketServer({ noServer: true });

    serverRest.on("upgrade", (req, socket, head) => {
      this.handleKoneksiWs(wss, req, socket, head);
    });

    console.log("Running websocket server");
  }

  private handleKoneksiWs(
    wss: WebSocketServer,
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ): void {
    const url = req.url ?? "";
    const pathname = url.split("?")[0];

    const WS_NOTIFIKASI_PATTERN = /^\/api\/notifikasi\/ws$/;
    const WS_DASHBOARD_PATTERN = /^\/api\/dashboard\/ws$/;
    const WS_CHATBOT_MONITORING_PATTERN = /^\/api\/dashboard\/chatbot\/ws$/;

    if (WS_NOTIFIKASI_PATTERN.test(pathname)) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleNotifikasiWsUpgrade(ws, req).catch((err) => {
          console.error(new Date().toISOString(), "[WS] Notifikasi upgrade error:", err);
          ws.close(4500, "Internal server error");
        });
      });
      return;
    }

    if (WS_DASHBOARD_PATTERN.test(pathname)) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleDashboardWsUpgrade(ws, req).catch((err) => {
          console.error(new Date().toISOString(), "[WS] Dashboard upgrade error:", err);
          ws.close(4500, "Internal server error");
        });
      });
      return;
    }

    if (WS_CHATBOT_MONITORING_PATTERN.test(pathname)) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        handleChatbotMonitoringWsUpgrade(ws, req).catch((err) => {
          console.error(new Date().toISOString(), "[WS] Chatbot monitoring upgrade error:", err);
          ws.close(4500, "Internal server error");
        });
      });
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      for (const route of this.router.getRoutes()) {
        // remove query
        const urlWithoutQuery = (req.url ?? "").split("?")[0];

        const pattern = new RegExp(`^${route.path}$`, "i");
        if (!pattern.test(urlWithoutQuery)) {
          continue;
        }

        if (route.targets.length === 0) {
          break;
        }

        const callHandlers = async () => {
          const context: WsContext = {
            sesiPengguna: null,
          };
          for (const target of route.targets) {
            try {
              await target.handle(ws, req, context);
            }
            catch (e) {
              this.handleError(ws, e);
              break;
            }
          }
        };
        callHandlers().catch(e => this.handleError(ws, e));

        return;
      }

      this.kirimResponseError(ws, 4404, {
        error: ApiErrorCodes.RouteNotFound,
        message: "route not found",
      });
    });
  }

  private handleError(ws: WebSocket, err: any) {
    if (err instanceof UnauthenticatedError) {
      this.kirimResponseError(ws, 4401, {
        error: ApiErrorCodes.Unauthenticated,
        message: err.reason === UnauthenticatedReason.InvalidToken ? "invalid token" : "unauthenticated",
      });
    }
    else if (err instanceof ForbiddenError) {
      this.kirimResponseError(ws, 4403, {
        error: ApiErrorCodes.Forbidden,
        message: "you don't have permission to access this resource.",
      });
    }
    else {
      console.error(err);
      this.kirimResponseError(ws, 4500, {
        error: ApiErrorCodes.ServerError,
        message: "internal server error",
      });
    }
  }

  private kirimResponseError(ws: WebSocket, code: number, response: WsErrorResponse) {
    ws.close(code, JSON.stringify(response));
  }
}
