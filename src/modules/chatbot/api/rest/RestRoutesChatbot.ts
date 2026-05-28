import express from "express";
import multer from "multer";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

export const routerChatbot = express.Router();
const kontrolChat = DI.provideKontrolChat();

const multerStorageLampiranChat = multer.memoryStorage();

const multerUploadLampiranChat = multer({
  storage: multerStorageLampiranChat,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    }
    else {
      cb(null, false);
    }
  },
});

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
routerChatbot.post("/", auth([PeranPengguna.Karyawan]), multerUploadLampiranChat.array("files", 5), (req, res, next) => {
  kontrolChat.buatChat(req, res).catch(next);
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
// routerChatbot.post("/:idChat", auth([PeranPengguna.Karyawan]), multerUpload.array("files", 5), (req, res, next) => {
//   kontrolChat.balasChat(req, res).catch(next);
// });

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
routerChatbot.get("/", auth([PeranPengguna.Karyawan]), (req, res, next) => {
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
routerChatbot.get("/:id", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolChat.getDetailChat(req, res).catch(next);
});
