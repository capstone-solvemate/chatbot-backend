import { vi } from "vitest";

import type { LogoutEventBus } from "./LogoutEventBus.js";

export function mockLogoutEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  } as unknown as LogoutEventBus;
}
