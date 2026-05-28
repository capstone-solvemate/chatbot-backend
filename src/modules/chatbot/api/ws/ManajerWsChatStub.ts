import { vi } from "vitest";

import type { KoneksiWsChat } from "./KoneksiWsChat.js";
import type { ManajerWsChat } from "./ManajerWsChat.js";

export function mockManajerWsChat(ovd: {
  tambahKoneksiPesanBaru?: (koneksiWs: KoneksiWsChat) => string;
} = {}) {
  return {
    tambahKoneksiPesanBaru: ovd.tambahKoneksiPesanBaru ?? vi.fn().mockReturnValue(""),
  } as unknown as ManajerWsChat;
}
