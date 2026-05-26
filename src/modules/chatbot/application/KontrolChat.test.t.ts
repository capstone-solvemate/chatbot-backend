import { describe, it } from "vitest";

import type { RepositoriLampiran } from "~/modules/upload/data/RepositoriLampiran.js";

import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";
import { mockRepositoriLampiran } from "~/modules/upload/data/RepositoriLampiranStub.js";
import { mockExpressRequest, mockExpressResponse } from "~test/ExpressStub.js";

import type { RepositoriChat } from "../data/RepositoriChat.js";
import type { ChatEventBus } from "../event/ChatEventBus.js";
import type { ChatWsManager } from "./ChatWsManager.js";
import type { RagWorkerClient } from "./RagWorkerClient.js";

import { mockRepositoriChat } from "../data/RepositoriChatStub.js";
import { mockChatEventBus } from "../event/ChatEventBusStub.js";
import { mockChatWsManager } from "./ChatWsManagerStub.js";
import { KontrolChat } from "./KontrolChat.js";
import { mockRagWorkerClient } from "./RagWorkerClientStub.js";

function buatKontrolChat(deps: {
  repositoriChat?: RepositoriChat;
  chatWsManager?: ChatWsManager;
  ragWorkerClient?: RagWorkerClient;
  chatEventBus?: ChatEventBus;
  repositoriLampiran?: RepositoriLampiran;
} = {}): KontrolChat {
  return new KontrolChat(
    deps.repositoriChat ?? mockRepositoriChat(),
    deps.chatWsManager ?? mockChatWsManager(),
    deps.ragWorkerClient ?? mockRagWorkerClient(),
    deps.chatEventBus ?? mockChatEventBus(),
    deps.repositoriLampiran ?? mockRepositoriLampiran(),
  );
}

describe("KontrolChat", () => {
  describe("fungsi buatChat", () => {
    const contohBodyBuatChat = {
      pesan: "how to resolve paper jam?",
    };

    it("harus memanggil fungsi 'buatChat' class 'RepositoriChat'", async () => {
      const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
      req.body = contohBodyBuatChat;
      const res = mockExpressResponse();

      const repositoriChat = mockRepositoriChat();

      const kontrol = buatKontrolChat({
        repositoriChat,
      });

      await kontrol.buatChat(req, res);
    });
  });
});
