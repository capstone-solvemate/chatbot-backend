import { vi } from "vitest";

import type { RepositoriChat } from "./RepositoriChat.js";

export function mockRepositoriChat() {
  return {
    pulihkanChatTerputus: vi.fn().mockResolvedValue(0),
    buatChat: vi.fn(),
    buatPesanChat: vi.fn(),
  } as unknown as RepositoriChat;
}
