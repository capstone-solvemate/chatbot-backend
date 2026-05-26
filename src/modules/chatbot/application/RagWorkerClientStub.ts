import { vi } from "vitest";

import type { RagWorkerClient } from "./RagWorkerClient.js";

export function mockRagWorkerClient() {
  return {
    tambahTugas: vi.fn(),
  } as unknown as RagWorkerClient;
}
