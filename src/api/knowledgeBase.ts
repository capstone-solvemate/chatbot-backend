import express from "express";
import multer from "multer";
import path from "node:path";

import { KontrolKnowledgeBase } from "../modules/knowledge_base/business/KontrolKnowledgeBase.js";

const router = express.Router();
const kontrol = KontrolKnowledgeBase.instance;

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/knowledge_base/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * @swagger
 * tags:
 *   name: Knowledge Base
 *   description: Manajemen dokumen knowledge base (Admin only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DokumenKB:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID dokumen (BigInt as string)
 *           example: "1"
 *         doc_id:
 *           type: string
 *           description: UUID unik dokumen
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         nama_berkas:
 *           type: string
 *           description: Nama file asli
 *           example: "manual-epson-l3210.pdf"
 *         path:
 *           type: string
 *           description: Path fisik file di server
 *           example: "uploads/knowledge_base/1234567890-123456789.pdf"
 *         status:
 *           type: string
 *           enum: [BelumDiproses, SedangDiproses, SelesaiDiproses]
 *           example: "BelumDiproses"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/admin/knowledge-base:
 *   get:
 *     summary: Mendapatkan semua dokumen knowledge base
 *     tags: [Knowledge Base]
 *     security:
 *       - csrfAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua dokumen berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DokumenKB'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: internal_error
 *                 message:
 *                   type: string
 *                   example: Gagal mengambil daftar dokumen
 */
router.get("/", (req, res) => kontrol.getSemuaDokumen(req, res));

/**
 * @swagger
 * /api/admin/knowledge-base/upload:
 *   post:
 *     summary: Upload dokumen PDF ke knowledge base
 *     tags: [Knowledge Base]
 *     security:
 *       - csrfAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File PDF yang akan diunggah (maks. 10MB)
 *     responses:
 *       201:
 *         description: File berhasil diunggah dan masuk antrian pemrosesan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File berhasil diunggah dan masuk antrian pemrosesan
 *                 dokumen:
 *                   $ref: '#/components/schemas/DokumenKB'
 *       400:
 *         description: Tidak ada file yang diunggah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: bad_request
 *                 message:
 *                   type: string
 *                   example: Tidak ada file yang diunggah
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: internal_error
 *                 message:
 *                   type: string
 *                   example: Gagal menyimpan dokumen
 */
router.post("/upload", upload.single("file"), (req, res) => kontrol.uploadDokumen(req, res));

/**
 * @swagger
 * /api/admin/knowledge-base/{id}:
 *   delete:
 *     summary: Hapus dokumen knowledge base berdasarkan ID
 *     tags: [Knowledge Base]
 *     security:
 *       - csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dokumen yang akan dihapus
 *         example: "1"
 *     responses:
 *       200:
 *         description: Dokumen berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dokumen berhasil dihapus
 *       404:
 *         description: Dokumen tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: not_found
 *                 message:
 *                   type: string
 *                   example: Dokumen tidak ditemukan
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: internal_error
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan saat menghapus dokumen
 */
router.delete("/:id", (req, res) => kontrol.hapusDokumen(req, res));

export const routerKnowledgeBase = router;
