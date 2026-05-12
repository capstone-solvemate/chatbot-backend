import express from "express";
import multer from "multer";
import path from "node:path";

import { DI } from "~/di/DI.js";

import { auth } from "../middlewares.js";
import { PeranPengguna } from "../modules/pengguna/domain/PeranPengguna.js";

const router = express.Router();
const kontrol = DI.provideKontrolUpload();

const semuaPeran = [PeranPengguna.Karyawan, PeranPengguna.Admin];

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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
 * POST /api/upload?konteks=chat
 * POST /api/upload?konteks=tiket
 *
 * Upload gambar untuk chat atau tiket.
 * Field form-data: "file"
 */
router.post("/", auth(semuaPeran), upload.single("file"), (req, res, next) => {
  kontrol.uploadGambar(req, res).catch(next);
});

/**
 * DELETE /api/upload/:id
 *
 * Hapus lampiran berdasarkan ID. Hanya pemilik yang boleh menghapus.
 */
router.delete("/:id", auth(semuaPeran), (req, res, next) => {
  kontrol.hapusGambar(req, res).catch(next);
});

export const routerUpload = router;
