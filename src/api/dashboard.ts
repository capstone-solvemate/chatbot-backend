import type { IncomingMessage } from "node:http";
import type WebSocket from "ws";

import express from "express";

import { DI } from "~/di/DI.js";

import type { FilterDashboard } from "../modules/dashboard/domain/DashboardPayload.js";

import { PeranPengguna } from "../modules/pengguna/domain/PeranPengguna.js";

const routerDashboard = express.Router();
const repositoriSession = DI.provideRepositoriSession();
const dashboardWsManager = DI.provideDashboardWsManager();
const chatbotMonitoringWsManager = DI.provideChatbotMonitoringWsManager();

/**
 * Parse filter dari query string WebSocket URL.
 * URL contoh: /api/dashboard/ws?tahun=2026&bulan=4
 *
 * Aturan:
 *   - tahun : wajib, integer >= 2000, default tahun berjalan
 *   - bulan : opsional, 1–12
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

  return { tahun, bulan };
}

/**
 * Handler upgrade WebSocket untuk /api/dashboard/ws
 * Hanya Admin yang diizinkan.
 */
export async function handleDashboardWsUpgrade(
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
  if (!session || !session.idPengguna || session.peranPengguna !== PeranPengguna.Admin) {
    ws.close(4001, "Unauthenticated");
    return;
  }

  const filter = parseFilter(req.url ?? "");
  await dashboardWsManager.tambahKoneksi(ws, session.id, filter);
}

/**
 * Handler upgrade WebSocket untuk /api/dashboard/chatbot/ws
 * Hanya Admin yang diizinkan.
 */
export async function handleChatbotMonitoringWsUpgrade(
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
  if (!session || !session.idPengguna || session.peranPengguna !== PeranPengguna.Admin) {
    ws.close(4001, "Unauthenticated");
    return;
  }

  const filter = parseFilter(req.url ?? "");
  await chatbotMonitoringWsManager.tambahKoneksi(ws, session.id, filter);
}

export default routerDashboard;
