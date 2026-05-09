import type { IncomingMessage } from "node:http";
import type WebSocket from "ws";

import express from "express";

import { DI } from "~/di/DI.js";

import type { FilterDashboard } from "../modules/dashboard/domain/DashboardPayload.js";

import { DashboardWsManager } from "../modules/dashboard/business/DashboardWsManager.js";
import { PeranPengguna } from "../modules/pengguna/domain/PeranPengguna.js";

const routerDashboard = express.Router();
const repositoriSession = DI.provideRepositoriSession();
const dashboardWsManager = DashboardWsManager.instance;

// Tidak ada HTTP endpoint untuk dashboard saat ini.
// Semua komunikasi via WebSocket di bawah.

/**
 * Parse filter dari query string WebSocket URL.
 * URL contoh: /api/dashboard/ws?tahun=2026&bulan=4&minggu=2
 *
 * Aturan:
 *   - tahun  : wajib, integer >= 2000, default tahun berjalan
 *   - bulan  : opsional, 1–12
 *   - minggu : opsional, 1–5, hanya valid jika bulan aktif
 */
function parseFilter(url: string): FilterDashboard {
  const searchParams = new URL(url, "http://localhost").searchParams;

  const tahunRaw = searchParams.get("tahun");
  const tahun = tahunRaw ? Number.parseInt(tahunRaw, 10) : new Date().getFullYear();

  if (!Number.isFinite(tahun) || tahun < 2000) {
    return { tahun: new Date().getFullYear() };
  }

  const bulanRaw = searchParams.get("bulan");
  const bulan = bulanRaw ? Number.parseInt(bulanRaw, 10) : undefined;

  if (bulan === undefined || bulan < 1 || bulan > 12) {
    return { tahun };
  }

  const mingguRaw = searchParams.get("minggu");
  const minggu = mingguRaw ? Number.parseInt(mingguRaw, 10) : undefined;

  if (minggu === undefined || minggu < 1 || minggu > 5) {
    return { tahun, bulan };
  }

  return { tahun, bulan, minggu };
}

/**
 * Handler upgrade WebSocket untuk /api/dashboard/ws
 * Dipanggil dari app.ts saat HTTP upgrade event.
 * Tidak melalui Express router karena WS tidak menggunakan HTTP response biasa.
 */
export async function handleDashboardWsUpgrade(
  ws: WebSocket,
  req: IncomingMessage,
): Promise<void> {
  // Baca session dari cookie — sama persis dengan pola di chat.ts
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
  if (!session || !session.idPengguna || session.peranPengguna !== PeranPengguna.Admin) {
    ws.close(4001, "Unauthenticated");
    return;
  }

  const filter = parseFilter(req.url ?? "");
  await dashboardWsManager.tambahKoneksi(ws, session.id, filter);
}

export default routerDashboard;
