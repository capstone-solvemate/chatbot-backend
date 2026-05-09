// src/modules/knowledge_base/data/converters.test.ts
import { Sequelize } from "sequelize";
import { beforeAll, describe, expect, it } from "vitest";

import { initModelKnowledgeBase, ModelKnowledgeBase } from "~/models/ModelKnowledgeBase.js";

import { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";
import { knowledgeBaseToRow, modelToKnowledgeBase } from "./converters.js";

beforeAll(() => {
  const sequelize = new Sequelize({ dialect: "mysql", logging: false });
  initModelKnowledgeBase(sequelize);
});

describe("converter domain KnowledgeBase ke model data dan sebaliknya", () => {
  describe("fungsi modelToKnowledgeBase", () => {
    it("memetakan semua field dengan benar", () => {
      const now = new Date();
      const model = ModelKnowledgeBase.build({
        id: BigInt(1),
        doc_id: "abc-123",
        judul: "Panduan Jaringan",
        id_kategori: 3,
        nama_berkas: "panduan.pdf",
        path: "/uploads/panduan.pdf",
        status: 1,
      });
      (model as any).created_at = now;
      (model as any).updated_at = now;

      const result = modelToKnowledgeBase(model);

      expect(result.id).toBe(BigInt(1));
      expect(result.docId).toBe("abc-123");
      expect(result.judul).toBe("Panduan Jaringan");
      expect(result.idKategori).toBe(3);
      expect(result.namaBerkas).toBe("panduan.pdf");
      expect(result.path).toBe("/uploads/panduan.pdf");
      expect(result.status).toBe(StatusKnowledgeBase.BelumDiproses);
      expect(result.createdAt).toStrictEqual(now);
      expect(result.updatedAt).toStrictEqual(now);
    });

    it("createdAt dan updatedAt undefined jika null", () => {
      const model = ModelKnowledgeBase.build({
        id: BigInt(2),
        doc_id: "xyz-456",
        judul: "Laporan Bulanan",
        id_kategori: 1,
        nama_berkas: "laporan.pdf",
        path: "/uploads/laporan.pdf",
        status: 1,
      });

      const result = modelToKnowledgeBase(model);

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it.each([
      { int: 1, expected: StatusKnowledgeBase.BelumDiproses },
      { int: 2, expected: StatusKnowledgeBase.SedangDiproses },
      { int: 3, expected: StatusKnowledgeBase.SelesaiDiproses },
      { int: 99, expected: StatusKnowledgeBase.BelumDiproses },
    ])("status int $int dipetakan ke StatusKnowledgeBase $expected", ({ int, expected }) => {
      const model = ModelKnowledgeBase.build({
        id: BigInt(1),
        doc_id: "test",
        judul: "Test Dokumen",
        id_kategori: 1,
        nama_berkas: "test.pdf",
        path: "/test.pdf",
        status: int,
      });

      expect(modelToKnowledgeBase(model).status).toBe(expected);
    });
  });

  describe("fungsi knowledgeBaseToRow", () => {
    it("memetakan semua field dengan benar", () => {
      const result = knowledgeBaseToRow({
        id: BigInt(1),
        docId: "abc-123",
        judul: "Panduan Jaringan",
        idKategori: 3,
        namaBerkas: "panduan.pdf",
        path: "/uploads/panduan.pdf",
        status: StatusKnowledgeBase.BelumDiproses,
      });

      expect(result.doc_id).toBe("abc-123");
      expect(result.judul).toBe("Panduan Jaringan");
      expect(result.id_kategori).toBe(3);
      expect(result.nama_berkas).toBe("panduan.pdf");
      expect(result.path).toBe("/uploads/panduan.pdf");
      expect(result.status).toBe(1);
    });

    it.each([
      { status: StatusKnowledgeBase.BelumDiproses, expected: 1 },
      { status: StatusKnowledgeBase.SedangDiproses, expected: 2 },
      { status: StatusKnowledgeBase.SelesaiDiproses, expected: 3 },
    ])("status $status dipetakan ke int $expected", ({ status, expected }) => {
      const result = knowledgeBaseToRow({
        id: BigInt(1),
        docId: "test",
        judul: "Test Dokumen",
        idKategori: 1,
        namaBerkas: "test.pdf",
        path: "/test.pdf",
        status,
      });

      expect(result.status).toBe(expected);
    });
  });
});
