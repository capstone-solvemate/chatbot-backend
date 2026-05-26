import { vi } from "vitest";

import type { WsHandler } from "./WsHandler.js";

export function mockWsHandler(): WsHandler {
  return {
    handle: vi.fn(),
  } as unknown as WsHandler;
}
