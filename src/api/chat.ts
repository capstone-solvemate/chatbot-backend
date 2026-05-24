import type { IncomingMessage } from "node:http";
import type WebSocket from "ws";

import express from "express";

import { multerUpload } from "../config/multerConfig.js";

import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { DI } from "../di/DI.js";
import { auth } from "../middlewares.js";

const routerChat = express.Router();
const kontrolChat = DI.provideKontrolChat();
const repositoriSession = DI.provideRepositoriSession();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Membuat sesi chat baru dan mengajukan pertanyaan pertama
 *     tags: [Chat]
 *     security:
 *       - csrfAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pesan
 *             properties:
 *               pesan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesi chat berhasil dibuat, pertanyaan masuk antrian RAG
 */
routerChat.post("/", auth([PeranPengguna.Karyawan]), multerUpload.array("files", 5), (req, res, next) => {
  kontrolChat.submitPertanyaan(req, res).catch(next);
});

/**
 * @swagger
 * /api/chat/{idChat}:
 *   post:
 *     summary: Membalas pesan dalam sesi chat yang sudah ada
 *     tags: [Chat]
 *     security:
 *       - csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: idChat
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pesan
 *             properties:
 *               pesan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pesan tersimpan, jawaban masuk antrian RAG
 *       404:
 *         description: Sesi chat tidak ditemukan
 *       409:
 *         description: Chat sedang diproses atau sudah dialihkan ke tiket
 */
routerChat.post("/:idChat", auth([PeranPengguna.Karyawan]), multerUpload.array("files", 5), (req, res, next) => {
  kontrolChat.balasChat(req, res).catch(next);
});

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Mendapatkan riwayat semua sesi chat milik pengguna
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar chat
 */
routerChat.get("/", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolChat.getRiwayatChat(req, res).catch(next);
});

/**
 * @swagger
 * /api/chat/{id}:
 *   get:
 *     summary: Mendapatkan detail pesan dalam satu sesi chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan detail chat
 */
routerChat.get("/:id", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolChat.getDetailChat(req, res).catch(next);
});

/**
 * Handler upgrade WebSocket untuk /api/chat/:idChat/ws
 * Dipanggil dari app.ts saat HTTP upgrade event.
 */
export async function handleChatWsUpgrade(
  ws: WebSocket,
  req: IncomingMessage,
  idChat: bigint,
): Promise<void> {
  const cookieHeader = req.headers.cookie ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map(c => c.trim().split("=").map(decodeURIComponent)),
  );
  const sessionId = cookies.session;

  if (!sessionId) {
    ws.close(4001, "Unauthenticated");
    return;
  }

  const session = await repositoriSession.getById(sessionId);
  if (!session || !session.idPengguna || session.peranPengguna !== PeranPengguna.Karyawan) {
    ws.close(4001, "Unauthenticated");
    return;
  }

  await kontrolChat.handleWsConnect(ws, idChat, session.idPengguna, session.id);
}

export default routerChat;
