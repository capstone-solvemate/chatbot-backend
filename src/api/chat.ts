import express from "express";

import { auth } from "../middlewares.js";
import { KontrolChat } from "../modules/chat/business/KontrolChat.js";
import { PeranPengguna } from "../modules/otentikasi/domain/PeranPengguna.js";

const routerChat = express.Router();
const kontrolChat = KontrolChat.instance;

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Mengajukan pertanyaan ke asisten (RAG)
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
 *               idChat:
 *                 type: string
 *                 description: Kosongkan jika ingin membuat sesi chat baru
 *               pesan:
 *                 type: string
 *                 description: Pertanyaan Anda
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan jawaban
 *       404:
 *         description: Sesi chat tidak ditemukan
 *       503:
 *         description: Simulator RAG tidak berjalan
 */
routerChat.post("/", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolChat.submitPertanyaan(req, res).catch(next);
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
routerChat.get("/", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res, next) => {
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
routerChat.get("/:id", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolChat.getDetailChat(req, res).catch(next);
});

export default routerChat;
