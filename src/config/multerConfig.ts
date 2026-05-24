import multer from "multer";
import path from "node:path";

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

/**
 * Middleware Multer yang siap dipakai di route chat maupun tiket.
 * Menerima file gambar (JPEG/PNG) maks 10 MB.
 */
export const multerUpload = multer({
  storage,
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
