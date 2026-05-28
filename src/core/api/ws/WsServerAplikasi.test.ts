import { describe, expect, it, vi } from "vitest";
import { WebSocket } from "ws";

import { ForbiddenError } from "~/core/types/ForbiddenError.js";
import { UnauthenticatedError, UnauthenticatedReason } from "~/core/types/UnauthenticatedError.js";
import { jalankanWsServerAplikasi } from "~test/stub/WsStub.js";

import type { WsErrorResponse } from "./dto/WsErrorResponse.js";

import { ApiErrorCodes } from "../ApiErrorCodes.js";
import { mockWsHandler } from "./types/WsHandlerStub.js";
import { WsRouter } from "./types/WsRouter.js";

describe("WsServerAplikasi", () => {
  it("harus memanggil fungsi 'handle' class 'WebSocketHandler'", async () => {
    const mockHandler = mockWsHandler();

    const router = new WsRouter();
    router.route("/ws", mockHandler);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise<void>(resolve => ws.on("open", resolve));

    expect(mockHandler.handle).toHaveBeenCalledOnce();

    ws.close();
    restServer.close();
  });

  it("harus memanggil fungsi 'handle' seluruh handler jika tidak terjadi error", async () => {
    const mockHandler1 = mockWsHandler();
    const mockHandler2 = mockWsHandler();
    const mockHandler3 = mockWsHandler();

    const router = new WsRouter();
    router.route("/ws", mockHandler1, mockHandler2, mockHandler3);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise<void>(resolve => ws.on("open", resolve));

    expect(mockHandler1.handle).toHaveBeenCalledOnce();
    expect(mockHandler2.handle).toHaveBeenCalledOnce();
    expect(mockHandler3.handle).toHaveBeenCalledOnce();

    ws.close();
    restServer.close();
  });

  it("dilarang memanggil fungsi 'handle' handler selanjutnya jika terjadi error pada handler saat itu", async () => {
    const mockHandler1 = mockWsHandler();

    const mockHandler2 = mockWsHandler();
    mockHandler2.handle = vi.fn().mockRejectedValue(new Error("Custom error"));

    const mockHandler3 = mockWsHandler();

    const router = new WsRouter();
    router.route("/ws", mockHandler1, mockHandler2, mockHandler3);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise<void>(resolve => ws.on("open", resolve));

    expect(mockHandler1.handle).toHaveBeenCalledOnce();
    expect(mockHandler2.handle).toHaveBeenCalledOnce();
    expect(mockHandler3.handle).not.toHaveBeenCalledOnce();

    ws.close();
    restServer.close();
  });

  it("harus memberi kode '4404' dan pesan error 'route_not_found' ke client jika route tidak ditemukan", async () => {
    const mockHandler = mockWsHandler();

    const router = new WsRouter();
    router.route("/ws", mockHandler);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    let code = 0;
    let reason = "";

    const ws = new WebSocket(`ws://localhost:${port}/chat/ws`);
    await new Promise<void>(resolve => ws.on("close", (mCode, mReason) => {
      code = mCode;
      reason = mReason.toString("utf8");
      resolve();
    }));

    expect(code).toBe(4404);

    const errMsg = JSON.parse(reason) as WsErrorResponse;
    expect(errMsg.error).toBe(ApiErrorCodes.RouteNotFound);

    ws.close();
    restServer.close();
  });

  it("harus memberi kode '4401' dan pesan error 'unauthenticated' ke client jika terjadi error unauthenticated", async () => {
    const mockHandler = mockWsHandler();
    mockHandler.handle = vi.fn().mockRejectedValue(new UnauthenticatedError(UnauthenticatedReason.InvalidToken));

    const router = new WsRouter();
    router.route("/ws", mockHandler);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    let code = 0;
    let reason = "";

    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise<void>(resolve => ws.on("close", (mCode, mReason) => {
      code = mCode;
      reason = mReason.toString("utf8");
      resolve();
    }));

    expect(code).toBe(4401);

    const errMsg = JSON.parse(reason) as WsErrorResponse;
    expect(errMsg.error).toBe(ApiErrorCodes.Unauthenticated);

    ws.close();
    restServer.close();
  });

  it("harus memberi kode '4403' dan pesan error 'forbidden' ke client jika terjadi error forbidden", async () => {
    const mockHandler = mockWsHandler();
    mockHandler.handle = vi.fn().mockRejectedValue(new ForbiddenError());

    const router = new WsRouter();
    router.route("/ws", mockHandler);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    let code = 0;
    let reason = "";

    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise<void>(resolve => ws.on("close", (mCode, mReason) => {
      code = mCode;
      reason = mReason.toString("utf8");
      resolve();
    }));

    expect(code).toBe(4403);

    const errMsg = JSON.parse(reason) as WsErrorResponse;
    expect(errMsg.error).toBe(ApiErrorCodes.Forbidden);

    ws.close();
    restServer.close();
  });

  it("harus memberi kode '4500' dan pesan error 'server_error' ke client jika terjadi error umum atau bersifat rahasia", async () => {
    const mockHandler = mockWsHandler();
    mockHandler.handle = vi.fn().mockRejectedValue(new Error("Custom error"));

    const router = new WsRouter();
    router.route("/ws", mockHandler);

    const { restServer, port } = jalankanWsServerAplikasi(router);

    let code = 0;
    let reason = "";

    const ws = new WebSocket(`ws://localhost:${port}/ws`);
    await new Promise<void>(resolve => ws.on("close", (mCode, mReason) => {
      code = mCode;
      reason = mReason.toString("utf8");
      resolve();
    }));

    expect(code).toBe(4500);

    const errMsg = JSON.parse(reason) as WsErrorResponse;
    expect(errMsg.error).toBe(ApiErrorCodes.ServerError);

    ws.close();
    restServer.close();
  });
});
