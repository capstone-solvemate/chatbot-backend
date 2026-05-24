import type { Buffer } from "node:buffer";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { WebSocketServer } from "ws";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import type MessageResponse from "./interfaces/message-response.js";

import { handleChatWsUpgrade } from "./api/chat.js";
import { handleChatbotMonitoringWsUpgrade, handleDashboardWsUpgrade } from "./api/dashboard.js";
import api from "./api/index.js";
import { handleNotifikasiWsUpgrade } from "./api/notifikasi.js";
import * as middlewares from "./middlewares.js";
import { DI } from "./di/DI.js";
import { PeranPengguna } from "./modules/pengguna/domain/PeranPengguna.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(middlewares.session);
app.use(middlewares.csrfGuard);
app.use(middlewares.nonProductionAlert);

// Serve gambar dengan autentikasi — hanya pembuat lampiran atau admin
const repositoriLampiran = DI.provideRepositoriLampiran();
app.get("/uploads/images/:filename", middlewares.auth([PeranPengguna.Karyawan, PeranPengguna.Admin]), (req, res, next) => {
  const { filename } = req.params;

  // Cegah path traversal
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    res.status(400).json({ error: "bad_request", message: "Nama file tidak valid." });
    return;
  }

  repositoriLampiran
    .getByNamaBerkas(filename)
    .then((lampiran) => {
      if (!lampiran) {
        res.status(404).json({ error: "not_found", message: "File tidak ditemukan." });
        return;
      }

      const sesi = req.sesiPengguna!;
      const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
      const isPemilik = lampiran.idPengunggah === sesi.idPengguna;

      if (!isAdmin && !isPemilik) {
        res.status(403).json({ error: "forbidden", message: "Anda tidak memiliki akses ke file ini." });
        return;
      }

      const filePath = path.resolve(process.cwd(), lampiran.path);
      res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      });
    })
    .catch(next);
});

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
const WS_NOTIFIKASI_PATTERN = /^\/api\/notifikasi\/ws$/;
const WS_DASHBOARD_PATTERN = /^\/api\/dashboard\/ws(?:\?.*)?$/;
const WS_CHATBOT_MONITORING_PATTERN = /^\/api\/dashboard\/chatbot\/ws(?:\?.*)?$/;

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

  const matchNotifikasi = WS_NOTIFIKASI_PATTERN.exec(url);
  if (matchNotifikasi) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      handleNotifikasiWsUpgrade(ws, req).catch((err) => {
        console.error(new Date().toISOString(), "[WS] Notifikasi upgrade error:", err);
        ws.close(4500, "Internal server error");
      });
    });
    return;
  }

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
        console.error(new Date().toISOString(), "[WS] Dashboard upgrade error:", err);
        ws.close(4500, "Internal server error");
      });
    });
    return;
  }

  const matchChatbotMonitoring = WS_CHATBOT_MONITORING_PATTERN.exec(url);
  if (matchChatbotMonitoring) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      handleChatbotMonitoringWsUpgrade(ws, req).catch((err) => {
        console.error(new Date().toISOString(), "[WS] Chatbot monitoring upgrade error:", err);
        ws.close(4500, "Internal server error");
      });
    });
    return;
  }

  // Tidak ada route yang cocok — tolak koneksi
  socket.destroy();
}

export default app;
