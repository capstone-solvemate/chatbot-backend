import type WebSocket from "ws";

export type KoneksiChat = {
  ws: WebSocket;
  idChat: bigint;
  idSession: string;
};
