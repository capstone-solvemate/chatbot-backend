// src/modules/knowledge_base/business/dto/converters.test.ts
import { describe, expect, it } from "vitest";

import { StatusKnowledgeBase } from "../../domain/StatusKnowledgeBase.js";
import { toResponseDto } from "./converters.js";

const baseKnowledgeBase = {
  id: 1n,
  docId: "550e8400-e29b-41d4-a716-446655440000",
  judul: "Panduan Jaringan",
  idKategori: 3,
  namaBerkas: "panduan.pdf",
  path: "/uploads/knowledge_base/panduan.pdf",
  status: StatusKnowledgeBase.BelumDiproses,
};

describe("toResponseDto", () => {
  it("memetakan semua field dengan benar", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const result = toResponseDto({
      ...baseKnowledgeBase,
      createdAt: now,
      updatedAt: now,
    });

    expect(result.id).toBe("1");
    expect(result.docId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.judul).toBe("Panduan Jaringan");
    expect(result.idKategori).toBe(3);
    expect(result.namaBerkas).toBe("panduan.pdf");
    expect(result.status).toBe(1);
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("id BigInt dikonversi ke string", () => {
    const result = toResponseDto({ ...baseKnowledgeBase, id: 9007199254740992n });
    expect(result.id).toBe("9007199254740992");
    expect(typeof result.id).toBe("string");
  });

  it("createdAt dan updatedAt undefined jika tidak ada", () => {
    const result = toResponseDto({ ...baseKnowledgeBase });
    expect(result.createdAt).toBeUndefined();
    expect(result.updatedAt).toBeUndefined();
  });

  it.each([
    { status: StatusKnowledgeBase.BelumDiproses, expected: 1 },
    { status: StatusKnowledgeBase.SedangDiproses, expected: 2 },
    { status: StatusKnowledgeBase.SelesaiDiproses, expected: 3 },
  ])("status $status dipetakan ke int $expected", ({ status, expected }) => {
    const result = toResponseDto({ ...baseKnowledgeBase, status });
    expect(result.status).toBe(expected);
  });

  it("createdAt ada tapi updatedAt tidak ada", () => {
    const now = new Date("2026-05-10T10:00:00.000Z");
    const result = toResponseDto({ ...baseKnowledgeBase, createdAt: now });
    expect(result.createdAt).toBe("2026-05-10T10:00:00.000Z");
    expect(result.updatedAt).toBeUndefined();
  });
});
