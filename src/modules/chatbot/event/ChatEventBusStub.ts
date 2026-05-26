import { vi } from "vitest";

import type { ChatEventBus } from "./ChatEventBus.js";

export function mockChatEventBus() {
  return {
    emit: vi.fn(),
  } as unknown as ChatEventBus;
}
