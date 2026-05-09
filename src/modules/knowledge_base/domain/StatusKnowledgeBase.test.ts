// src/modules/knowledge_base/domain/StatusKnowledgeBase.test.ts
import { describe, expect, it } from "vitest";

import {
  intToStatusKnowledgeBase,
  StatusKnowledgeBase,
  statusKnowledgeBaseToInt,
} from "./StatusKnowledgeBase.js";

describe("StatusKnowledgeBase", () => {
  describe("statusKnowledgeBaseToInt", () => {
    it.each([
      { status: StatusKnowledgeBase.BelumDiproses, expected: 1 },
      { status: StatusKnowledgeBase.SedangDiproses, expected: 2 },
      { status: StatusKnowledgeBase.SelesaiDiproses, expected: 3 },
    ])("mengkonversi $status ke int $expected", ({ status, expected }) => {
      expect(statusKnowledgeBaseToInt(status)).toBe(expected);
    });
  });

  describe("intToStatusKnowledgeBase", () => {
    it.each([
      { int: 1, expected: StatusKnowledgeBase.BelumDiproses },
      { int: 2, expected: StatusKnowledgeBase.SedangDiproses },
      { int: 3, expected: StatusKnowledgeBase.SelesaiDiproses },
    ])("mengkonversi int $int ke $expected", ({ int, expected }) => {
      expect(intToStatusKnowledgeBase(int)).toBe(expected);
    });

    it.each([0, 99, -1, 999])(
      "nilai tidak dikenal (%i) fallback ke BelumDiproses",
      (int) => {
        expect(intToStatusKnowledgeBase(int)).toBe(StatusKnowledgeBase.BelumDiproses);
      },
    );
  });

  describe("round-trip konsistensi", () => {
    it.each([
      StatusKnowledgeBase.BelumDiproses,
      StatusKnowledgeBase.SedangDiproses,
      StatusKnowledgeBase.SelesaiDiproses,
    ])("toInt → toStatus round-trip untuk %i", (status) => {
      expect(intToStatusKnowledgeBase(statusKnowledgeBaseToInt(status))).toBe(status);
    });
  });
});
