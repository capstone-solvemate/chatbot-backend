import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { WebSocket } from "ws";

import { vi } from "vitest";

import type { WsRouter } from "~/core/api/ws/types/WsRouter";

import { WsServerAplikasi } from "~/core/api/ws/WsServerAplikasi";

import { buatAppExpress } from "./ExpressStub.js";

export function jalankanWsServerAplikasi(router: WsRouter): {
  restServer: Server;
  port: number;
} {
  const appExpress = buatAppExpress();
  const server = appExpress.listen(0);

  const wssa = new WsServerAplikasi(router);
  wssa.jalankan(server);

  const port = (server.address() as AddressInfo).port;

  return {

    restServer: server,
    port,
  };
}

export function mockWs(): WebSocket {
  return {
    addEventListener: vi.fn(),
  } as unknown as WebSocket;
}
