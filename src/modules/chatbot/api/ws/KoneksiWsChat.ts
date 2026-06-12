import type WebSocket from "ws";

export class KoneksiWsChat {
  constructor(
    public readonly ws: WebSocket,
    public idChat: bigint | null,
    public readonly idSession: string,
    public readonly idPengguna: number,
    public idKoneksi: string = "",
  ) {
  }
}
