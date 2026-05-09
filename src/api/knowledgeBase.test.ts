import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
// test/knowledgeBase.test.ts
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "~/app.js";
import { RepositoriKnowledgeBase } from "~/modules/knowledge_base/data/RepositoriKnowledgeBase.js";
import { StatusKnowledgeBase } from "~/modules/knowledge_base/domain/StatusKnowledgeBase.js";

// Mock semua dependency sebelum import app
vi.mock("~/modules/knowledge_base/data/RepositoriKnowledgeBase.js", () => ({
  RepositoriKnowledgeBase: {
    instance: {
      getSemuaDokumen: vi.fn(),
      buatDokumen: vi.fn(),
      getDokumenById: vi.fn(),
      hapusDokumen: vi.fn(),
    },
  },
}));

vi.mock("node:fs/promises", () => ({
  default: { unlink: vi.fn() },
}));

// Mock middleware session & csrf agar tidak perlu DB nyata
vi.mock("~/middlewares.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("~/middlewares.js")>();
  return {
    ...original,
    session: vi.fn((req: any, _res: any, next: any) => {
      req.sesiPengguna = {
        sessionId: "test-session",
        csrfToken: "test-csrf",
        idPengguna: 1,
        peranPengguna: 2, // Admin
      };
      next();
    }),
    csrfGuard: vi.fn((_req: any, _res: any, next: any) => next()),
  };
});

const repositoriMock = vi.mocked(RepositoriKnowledgeBase.instance);

const mockDokumen = {
  id: 1n,
  docId: "550e8400-e29b-41d4-a716-446655440000",
  judul: "Panduan Jaringan",
  idKategori: 3,
  namaBerkas: "panduan.pdf",
  path: "uploads/knowledge_base/panduan.pdf",
  status: StatusKnowledgeBase.BelumDiproses,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
describe("GET /api/admin/knowledge-base", () => {
  it("200 — mengembalikan daftar dokumen", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([mockDokumen]);

    const res = await request(app)
      .get("/api/admin/knowledge-base")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: "1",
      judul: "Panduan Jaringan",
      idKategori: 3,
      namaBerkas: "panduan.pdf",
      status: 1,
    });
  });

  it("200 — mengembalikan array kosong jika tidak ada dokumen", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/admin/knowledge-base")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("500 — jika repositori melempar error", async () => {
    repositoriMock.getSemuaDokumen.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .get("/api/admin/knowledge-base")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(500);
  });
});

// ============================================================
describe("POST /api/admin/knowledge-base/upload", () => {
  it("201 — upload file berhasil", async () => {
    repositoriMock.buatDokumen.mockResolvedValue(mockDokumen);

    const res = await request(app)
      .post("/api/admin/knowledge-base/upload")
      .set("x-csrf-token", "test-csrf")
      .field("judul", "Panduan Jaringan")
      .field("idKategori", "3")
      .attach("file", Buffer.from("konten-pdf-palsu"), {
        filename: "panduan.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      message: "File berhasil diunggah dan masuk antrian pemrosesan",
      dokumen: expect.objectContaining({
        id: "1",
        judul: "Panduan Jaringan",
      }),
    });
  });

  it("422 — tidak ada file", async () => {
    const res = await request(app)
      .post("/api/admin/knowledge-base/upload")
      .set("x-csrf-token", "test-csrf")
      .send({ judul: "Panduan", idKategori: 3 });

    expect(res.status).toBe(422);
  });

  it("422 — judul tidak ada", async () => {
    const res = await request(app)
      .post("/api/admin/knowledge-base/upload")
      .set("x-csrf-token", "test-csrf")
      .field("idKategori", "3")
      .attach("file", Buffer.from("konten-pdf-palsu"), {
        filename: "panduan.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(422);
  });

  it("422 — idKategori tidak ada", async () => {
    const res = await request(app)
      .post("/api/admin/knowledge-base/upload")
      .set("x-csrf-token", "test-csrf")
      .field("judul", "Panduan Jaringan")
      .attach("file", Buffer.from("konten-pdf-palsu"), {
        filename: "panduan.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(422);
  });

  it("422 — idKategori negatif", async () => {
    const res = await request(app)
      .post("/api/admin/knowledge-base/upload")
      .set("x-csrf-token", "test-csrf")
      .field("judul", "Panduan")
      .field("idKategori", "-1")
      .attach("file", Buffer.from("konten-pdf-palsu"), {
        filename: "panduan.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(422);
  });
});

// ============================================================
describe("DELETE /api/admin/knowledge-base/:id", () => {
  it("200 — berhasil hapus dokumen", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(mockDokumen);
    repositoriMock.hapusDokumen.mockResolvedValue(true);
    (fs.unlink as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/api/admin/knowledge-base/1")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "Dokumen berhasil dihapus" });
  });

  it("404 — dokumen tidak ditemukan", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/admin/knowledge-base/999")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "not_found" });
  });

  it("200 — tetap berhasil meski file fisik tidak ada", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(mockDokumen);
    repositoriMock.hapusDokumen.mockResolvedValue(true);
    (fs.unlink as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("ENOENT"));

    const res = await request(app)
      .delete("/api/admin/knowledge-base/1")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "Dokumen berhasil dihapus" });
  });

  it("500 — jika repositori hapus melempar error", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(mockDokumen);
    (fs.unlink as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    repositoriMock.hapusDokumen.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .delete("/api/admin/knowledge-base/1")
      .set("x-csrf-token", "test-csrf");

    expect(res.status).toBe(500);
  });
});
