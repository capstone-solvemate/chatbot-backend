import type WebSocket from "ws";

export class KoneksiWsChat {
  constructor(
    public readonly ws: WebSocket,
    public readonly idChat: bigint | null,
    public readonly idSession: string,
    public idKoneksi: string = "",
  ) {}
}
