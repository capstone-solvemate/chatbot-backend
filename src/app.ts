import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import type MessageResponse from "./interfaces/message-response.js";

import api from "./api/index.js";
import { DI } from "./di/DI.js";
import * as middlewares from "./middlewares.js";
import { PeranPengguna } from "./modules/pengguna/domain/PeranPengguna.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost",        // Docker (nginx reverse proxy standard)
    "http://localhost:8080",   // Docker (nginx reverse proxy on port 8080)
    "http://localhost:5173",   // Local dev (Vite)
  ],
  credentials: true,
}));
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

export default app;
