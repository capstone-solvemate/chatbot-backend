import { vi } from "vitest";

import type { RowConverterChat } from "./RowConverterChat.js";

import { buatContohRowChat } from "./RowChatStub.js";
import { buatContohRowLampiranPesanChat } from "./RowLampiranPesanChatStub.js";
import { buatContohRowPesanChat } from "./RowPesanChatStub.js";

export function mockRowConverterChat() {
  return ({
    chatKeRow: vi.fn().mockReturnValue(buatContohRowChat()),
    pesanChatKeRow: vi.fn().mockReturnValue(buatContohRowPesanChat()),
    lampiranPesanChatKeRow: vi.fn().mockReturnValue(buatContohRowLampiranPesanChat()),
  }) as unknown as RowConverterChat;
}
