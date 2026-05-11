import type WebSocket from "ws";

export type KoneksiNotifikasi = {
  ws: WebSocket;
  idPengguna: number;
  idSession: string;
};
