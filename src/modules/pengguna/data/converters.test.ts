import { describe, expect, it } from "vitest";

import { Pengguna } from "../domain/Pengguna.js";
import { PeranPengguna, peranPenggunaToInt } from "../domain/PeranPengguna.js";
import { penggunaToRow, penggunaToRowPeran } from "./converters.js";

describe("converter data Pengguna", () => {
  describe("fungsi penggunaToRow", () => {
    it("memetakan semua field dengan benar", () => {
      const pengguna = new Pengguna(
        1,
        "testNama",
        "test@example.com",
        "$2a$12$XzOl21lTGZyjJTHYm4A7WeDLhtddOYEAW0YRB4xanuDDfRWREgPmO",
        [PeranPengguna.Admin],
      );

      const result = penggunaToRow(pengguna);

      expect(result.id).toBe(1);
      expect(result.nama).toBe("testNama");
      expect(result.email).toBe("test@example.com");
      expect(result.password).toBe("$2a$12$XzOl21lTGZyjJTHYm4A7WeDLhtddOYEAW0YRB4xanuDDfRWREgPmO");
    });
  });

  describe("fungsi penggunaToRowPeran", () => {
    it("menghasilkan 1 row ketika pengguna memiliki 1 peran", () => {
      const pengguna = new Pengguna(
        1,
        "testNama",
        "test@example.com",
        "$2a$12$XzOl21lTGZyjJTHYm4A7WeDLhtddOYEAW0YRB4xanuDDfRWREgPmO",
        [PeranPengguna.Admin],
      );

      const result = penggunaToRowPeran(pengguna);

      expect(result.length).toBe(1);
    });

    it("menghasilkan 2 row ketika pengguna memiliki 2 peran", () => {
      const pengguna = new Pengguna(
        1,
        "testNama",
        "test@example.com",
        "$2a$12$XzOl21lTGZyjJTHYm4A7WeDLhtddOYEAW0YRB4xanuDDfRWREgPmO",
        [PeranPengguna.Admin, PeranPengguna.Karyawan],
      );

      const result = penggunaToRowPeran(pengguna);

      expect(result.length).toBe(2);
    });

    it("memetakan semua field dengan benar", () => {
      const pengguna = new Pengguna(
        1,
        "testNama",
        "test@example.com",
        "$2a$12$XzOl21lTGZyjJTHYm4A7WeDLhtddOYEAW0YRB4xanuDDfRWREgPmO",
        [PeranPengguna.Admin],
      );

      const result = penggunaToRowPeran(pengguna);

      const rowPertama = result[0];

      expect(rowPertama.id_pengguna).toBe(1);
      expect(rowPertama.peran).toBe(peranPenggunaToInt(PeranPengguna.Admin));
    });
  });
});
