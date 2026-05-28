import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from "vitest";

import { ManajerWsChat } from "~/modules/chatbot/api/ws/ManajerWsChat";

import { migrateDatabase, resetDatabase } from "./penyiapan/sequelize.js";

describe("chatbot e2e test", () => {
  beforeAll(async () => {
    await migrateDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
  });

  describe("endpoint /api/chat/ws: listen pesan chat baru", () => {
    describe("jika kondisi sukses terpenuhi", () => {

    });

    describe("jika pengguna tidak terotentikasi", () => {
      describe("karena sesi belum ada", () => {
        it("harus memberi http status 401 ke client", async () => {

        });

        it("harus memutus koneksi websocket", async () => {

        });
      });

      describe("karena tidak ada pengguna terotentikasi pada sesi saat itu", () => {
        it("harus memberi http status 401 ke client", async () => {

        });

        it("harus memutus koneksi websocket", async () => {

        });
      });
    });
  });
});
