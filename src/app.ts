import type { Buffer } from "node:buffer";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { WebSocketServer } from "ws";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import type MessageResponse from "./interfaces/message-response.js";

import { handleChatWsUpgrade } from "./api/chat.js";
import { handleDashboardWsUpgrade } from "./api/dashboard.js";
import api from "./api/index.js";
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(middlewares.session);
app.use(middlewares.csrfGuard);
app.use(middlewares.nonProductionAlert);

app.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Pola URL WebSocket yang didukung
const WS_CHAT_PATTERN = /^\/api\/chat\/(\d+)\/ws$/;
const WS_DASHBOARD_PATTERN = /^\/api\/dashboard\/ws(?:\?.*)?$/;

/**
 * Dipanggil dari index.ts saat HTTP upgrade event.
 * Routing WS dilakukan di sini berdasarkan URL pattern.
 */
export function handleWsUpgrade(
  wss: WebSocketServer,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
): void {
  const url = req.url ?? "";

  const matchChat = WS_CHAT_PATTERN.exec(url);
  if (matchChat) {
    const idChat = BigInt(matchChat[1]);
    wss.handleUpgrade(req, socket, head, (ws) => {
      handleChatWsUpgrade(ws, req, idChat).catch((err) => {
        console.error(new Date().toISOString(), "[WS] Upgrade error:", err);
        ws.close(4500, "Internal server error");
      });
    });
    return;
  }

  const matchDashboard = WS_DASHBOARD_PATTERN.exec(url);
  if (matchDashboard) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      handleDashboardWsUpgrade(ws, req).catch((err) => {
        console.error(new Date().toISOString(), "[WS Dashboard] Upgrade error:", err);
        ws.close(4500, "Internal server error");
      });
    });
    return;
  }

  // Tidak ada route yang cocok — tolak koneksi
  socket.destroy();
}

export default app;
