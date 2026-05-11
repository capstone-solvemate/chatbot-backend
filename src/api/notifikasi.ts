import type { IncomingMessage } from "node:http";
import type WebSocket from "ws";

import express from "express";

import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { DI } from "../di/DI.js";
import { auth } from "../middlewares.js";

export const routerNotifikasi = express.Router();
const kontrolNotifikasi = DI.provideKontrolNotifikasi();
const repositoriSession = DI.provideRepositoriSession();

routerNotifikasi.get("/", auth([PeranPengguna.Karyawan, PeranPengguna.Admin]), (req, res, next) => {
  kontrolNotifikasi.getDaftarNotifikasi(req, res).catch(next);
});

routerNotifikasi.patch("/:id/baca", auth([PeranPengguna.Karyawan, PeranPengguna.Admin]), (req, res, next) => {
  kontrolNotifikasi.tandaiDibaca(req, res).catch(next);
});

routerNotifikasi.patch("/baca-semua", auth([PeranPengguna.Karyawan, PeranPengguna.Admin]), (req, res, next) => {
  kontrolNotifikasi.tandaiSemuaDibaca(req, res).catch(next);
});

export async function handleNotifikasiWsUpgrade(
  ws: WebSocket,
  req: IncomingMessage,
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
  if (!session || !session.idPengguna) {
    ws.close(4001, "Unauthenticated");
    return;
  }

  kontrolNotifikasi.handleWsConnect(ws, session.idPengguna, session.id);
}
