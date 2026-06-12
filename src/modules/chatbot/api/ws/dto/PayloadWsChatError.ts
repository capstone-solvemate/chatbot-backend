import type { PayloadWsChat } from "./PayloadWsChat.js";

export type PayloadWsChatError = {
  error: string;
  message: string;
} & PayloadWsChat;
