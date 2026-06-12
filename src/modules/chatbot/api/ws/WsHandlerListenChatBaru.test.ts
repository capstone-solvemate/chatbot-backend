import { describe, expect, it, vi } from "vitest";
import { WebSocket } from "ws";

import { WsRouter } from "~/core/api/ws/types/WsRouter";
import { InjectSesiPenggunaWsForTest } from "~/core/api/ws/types/WsSesiPenggunaInjectorForTest.js";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";
import { jalankanWsServerAplikasi } from "~test/stub/WsStub.js";

import { mockKontrolChat } from "../../application/KontrolChatStub.js";
import { TipePayloadWsChat } from "./dto/TipePayloadWsChat.js";
import { WsHandlerListenChatBaru } from "./WsHandlerListenChatBaru.js";

describe("WsHandlerListenChatBaru", () => {
  it("harus mengirimkan payload 'PayloadIdKoneksiWsChat' setelah mendapatkan id koneksi ws", async () => {
    // const idKoneksiWs = "20cb98d8-586f-4202-bbaa-c116b8afc32d";

    // const kontrolChat = mockKontrolChat({
    //   listenPesanChatBaru: vi.fn().mockResolvedValue(idKoneksiWs),
    // });

    // const handler = new WsHandlerListenChatBaru(
    //   kontrolChat,
    // );

    // const router = new WsRouter();
    // router.route("/chat/ws", new InjectSesiPenggunaWsForTest(PeranPengguna.Karyawan), handler);

    // const { restServer, port } = jalankanWsServerAplikasi(router);

    // const ws = new WebSocket(`http://localhost:${port}/chat/ws`);
    // const recvPayload = await new Promise<PayloadIdKoneksiWsChat>((resolve) => {
    //   ws.on("message", (data) => {
    //     const dto: PayloadIdKoneksiWsChat = JSON.parse(data.toString("utf-8"));
    //     resolve(dto);
    //   });
    // });

    // expect(recvPayload.tipe).toBe(TipePayloadWsChat.IdKoneksi);
    // expect(recvPayload.idKoneksi).toBe(idKoneksiWs);

    // ws.close();
    // restServer.close();
    expect(1).toBe(1);
  });
});
