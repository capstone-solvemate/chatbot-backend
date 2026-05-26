import type WebSocket from "ws";

import * as uuid from "uuid";

export class KoneksiWsChat {
  public readonly idKoneksi: string;

  constructor(
    public readonly ws: WebSocket,
    public readonly idChat: bigint | null,
    public readonly idSession: string,
  ) {
    this.idKoneksi = uuid.v4().toString();
  }
}
