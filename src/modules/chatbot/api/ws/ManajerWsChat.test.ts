import { describe, expect, it } from "vitest";

import { mockLogoutEventBus } from "~/modules/otentikasi/event/LogoutEventBusStub.js";
import { mockWs } from "~test/stub/WsStub.js";

import { KoneksiWsChat } from "./KoneksiWsChat.js";
import { ManajerWsChat } from "./ManajerWsChat.js";

describe("ManajerWsChat", () => {
  describe("fungsi tambahKoneksiPesanBaru", () => {
    it("harus menambah koneksi ke map koneksiByIdKoneksi dengan key id koneksi", () => {
      const manajerWsChat = new ManajerWsChat(mockLogoutEventBus());

      const koneksiWsChat = new KoneksiWsChat(
        mockWs(),
        null,
        "1234",
      );
      manajerWsChat.tambahKoneksiPesanBaru(koneksiWsChat);

      const mapKoneksiByIdKoneksi = manajerWsChat.testGetKoneksiByIdKoneksi();

      expect(mapKoneksiByIdKoneksi.size).toBe(1);
      expect(mapKoneksiByIdKoneksi.get(koneksiWsChat.idKoneksi)).toBe(koneksiWsChat);
    });

    it("harus menambah koneksi ke map koneksiByIdSession dengan key id session", () => {
      const manajerWsChat = new ManajerWsChat(mockLogoutEventBus());
      const idSession = "1233";

      const koneksiWsChat = new KoneksiWsChat(
        mockWs(),
        null,
        idSession,
      );
      manajerWsChat.tambahKoneksiPesanBaru(koneksiWsChat);

      const mapKoneksiByIdSession = manajerWsChat.testGetKoneksiByIdSession();

      expect(mapKoneksiByIdSession.size).toBe(1);
      expect(mapKoneksiByIdSession.get(koneksiWsChat.idSession)).not.toBe(undefined);

      expect(mapKoneksiByIdSession.get(koneksiWsChat.idSession)!.size).toBe(1);
      expect(mapKoneksiByIdSession.get(koneksiWsChat.idSession)!.get(koneksiWsChat.idKoneksi)).toBe(koneksiWsChat);
    });

    it("harus menambah koneksi ke kelompok id session yang sama pada map koneksiByIdSession", () => {
      const manajerWsChat = new ManajerWsChat(mockLogoutEventBus());
      const idSession = "1233";

      const koneksiWsChat1 = new KoneksiWsChat(
        mockWs(),
        null,
        idSession,
      );
      manajerWsChat.tambahKoneksiPesanBaru(koneksiWsChat1);

      const koneksiWsChat2 = new KoneksiWsChat(
        mockWs(),
        null,
        idSession,
      );
      manajerWsChat.tambahKoneksiPesanBaru(koneksiWsChat2);

      const mapKoneksiByIdSession = manajerWsChat.testGetKoneksiByIdSession();

      expect(mapKoneksiByIdSession.size).toBe(1);
      expect(mapKoneksiByIdSession.get(koneksiWsChat2.idSession)).not.toBe(undefined);

      expect(mapKoneksiByIdSession.get(koneksiWsChat2.idSession)!.size).toBe(2);
      expect(mapKoneksiByIdSession.get(koneksiWsChat2.idSession)!.get(koneksiWsChat2.idKoneksi)).toBe(koneksiWsChat2);
    });

    it("dilarang menambah koneksi ke map koneksiByIdChat", () => {
      const manajerWsChat = new ManajerWsChat(mockLogoutEventBus());
      const idSession = "1233";

      const koneksiWsChat = new KoneksiWsChat(
        mockWs(),
        null,
        idSession,
      );
      manajerWsChat.tambahKoneksiPesanBaru(koneksiWsChat);

      const mapKoneksiByIdChat = manajerWsChat.testGetKoneksiByIdChat();

      expect(mapKoneksiByIdChat.size).toBe(0);
    });

    it("mengembalikan id koneksi yang dibuat", () => {
      const manajerWsChat = new ManajerWsChat(mockLogoutEventBus());
      const idSession = "1233";

      const koneksiWsChat = new KoneksiWsChat(
        mockWs(),
        null,
        idSession,
      );
      const hasilIdKoneksi = manajerWsChat.tambahKoneksiPesanBaru(koneksiWsChat);

      expect(hasilIdKoneksi).toBe(koneksiWsChat.idKoneksi);
    });
  });
});
