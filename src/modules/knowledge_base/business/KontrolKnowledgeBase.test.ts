// src/modules/knowledge_base/business/KontrolKnowledgeBase.test.ts
import type { Request, Response } from "express";

import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ValidationError } from "~/core/types/ValidationError.js";

import { RepositoriKnowledgeBase } from "../data/RepositoriKnowledgeBase.js";
import { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";
import { KontrolKnowledgeBase } from "./KontrolKnowledgeBase.js";

// --- Mock dependencies ---
vi.mock("../data/RepositoriKnowledgeBase.js", () => ({
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
  default: {
    unlink: vi.fn(),
  },
}));

// --- Helper ---
function buatResponse(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    sendStatus: vi.fn().mockReturnThis(),
  };
  return res as Response;
}

function buatRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    sesiPengguna: {
      sessionId: "session-test",
      csrfToken: "csrf-test",
      idPengguna: 1,
      peranPengguna: null,
    },
    ...overrides,
  } as unknown as Request;
}

const mockDokumen = {
  id: 1n,
  docId: "550e8400-e29b-41d4-a716-446655440000",
  judul: "Panduan Jaringan",
  idKategori: 3,
  namaBerkas: "panduan.pdf",
  ukuranBerkas: 2_400_000,
  path: "uploads/knowledge_base/panduan.pdf",
  status: StatusKnowledgeBase.BelumDiproses,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const repositoriMock = vi.mocked(RepositoriKnowledgeBase.instance);
const kontrol = KontrolKnowledgeBase.instance;

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
describe("getSemuaDokumen", () => {
  it("mengembalikan array DTO hasil mapping dari repositori", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([mockDokumen, { ...mockDokumen, id: 2n }]);
    const req = buatRequest();
    const res = buatResponse();

    await kontrol.getSemuaDokumen(req, res);

    expect(repositoriMock.getSemuaDokumen).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "1", judul: "Panduan Jaringan", ukuranBerkas: 2_400_000 }),
        expect.objectContaining({ id: "2" }),
      ]),
    );
  });

  it("mengembalikan array kosong jika repositori kosong", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([]);
    const req = buatRequest();
    const res = buatResponse();

    await kontrol.getSemuaDokumen(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("meneruskan filter idKategori ke repositori", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([mockDokumen]);
    const req = buatRequest({ query: { idKategori: "3" } });
    const res = buatResponse();

    await kontrol.getSemuaDokumen(req, res);

    expect(repositoriMock.getSemuaDokumen).toHaveBeenCalledWith({ idKategori: 3, judul: undefined });
  });

  it("meneruskan filter judul ke repositori", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([mockDokumen]);
    const req = buatRequest({ query: { judul: "Panduan" } });
    const res = buatResponse();

    await kontrol.getSemuaDokumen(req, res);

    expect(repositoriMock.getSemuaDokumen).toHaveBeenCalledWith({ idKategori: undefined, judul: "Panduan" });
  });

  it("mengabaikan idKategori jika bukan angka valid", async () => {
    repositoriMock.getSemuaDokumen.mockResolvedValue([]);
    const req = buatRequest({ query: { idKategori: "abc" } });
    const res = buatResponse();

    await kontrol.getSemuaDokumen(req, res);

    expect(repositoriMock.getSemuaDokumen).toHaveBeenCalledWith({ idKategori: undefined, judul: undefined });
  });
});

// ============================================================
describe("uploadDokumen", () => {
  const mockFile: Express.Multer.File = {
    fieldname: "file",
    originalname: "panduan.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    destination: "uploads/knowledge_base/",
    filename: "1234567890-panduan.pdf",
    path: "uploads/knowledge_base/1234567890-panduan.pdf",
    size: 2_400_000,
    buffer: Buffer.from(""),
    stream: null as any,
  };

  it("memanggil buatDokumen dengan data yang benar dan response 201", async () => {
    repositoriMock.buatDokumen.mockResolvedValue(mockDokumen);
    const req = buatRequest({
      body: { judul: "Panduan Jaringan", idKategori: "3" },
      file: mockFile,
    });
    const res = buatResponse();

    await kontrol.uploadDokumen(req, res);

    expect(repositoriMock.buatDokumen).toHaveBeenCalledOnce();
    const argPanggilan = repositoriMock.buatDokumen.mock.calls[0][0];
    expect(argPanggilan.judul).toBe("Panduan Jaringan");
    expect(argPanggilan.idKategori).toBe(3);
    expect(argPanggilan.namaBerkas).toBe("panduan.pdf");
    expect(argPanggilan.ukuranBerkas).toBe(2_400_000);
    expect(argPanggilan.path).toBe("uploads/knowledge_base/1234567890-panduan.pdf");
    expect(argPanggilan.status).toBe(StatusKnowledgeBase.BelumDiproses);
    expect(typeof argPanggilan.docId).toBe("string");

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "File berhasil diunggah dan masuk antrian pemrosesan",
        dokumen: expect.objectContaining({ id: "1", judul: "Panduan Jaringan", ukuranBerkas: 2_400_000 }),
      }),
    );
  });

  it("melempar ValidationError jika tidak ada file", async () => {
    const req = buatRequest({
      body: { judul: "Panduan Jaringan", idKategori: "3" },
      file: undefined,
    });
    const res = buatResponse();

    await expect(kontrol.uploadDokumen(req, res)).rejects.toBeInstanceOf(ValidationError);
    expect(repositoriMock.buatDokumen).not.toHaveBeenCalled();
  });

  it("melempar ValidationError jika judul kosong", async () => {
    const req = buatRequest({
      body: { judul: "", idKategori: "3" },
      file: mockFile,
    });
    const res = buatResponse();

    await expect(kontrol.uploadDokumen(req, res)).rejects.toBeInstanceOf(ValidationError);
    expect(repositoriMock.buatDokumen).not.toHaveBeenCalled();
  });
});

// ============================================================
describe("hapusDokumen", () => {
  it("menghapus file fisik dan dokumen dari DB, response 200", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(mockDokumen);
    repositoriMock.hapusDokumen.mockResolvedValue(true);
    (fs.unlink as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const req = buatRequest({ params: { id: "1" } });
    const res = buatResponse();

    await kontrol.hapusDokumen(req, res);

    expect(repositoriMock.getDokumenById).toHaveBeenCalledWith(1n);
    expect(fs.unlink).toHaveBeenCalledWith(mockDokumen.path);
    expect(repositoriMock.hapusDokumen).toHaveBeenCalledWith(1n);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Dokumen berhasil dihapus" });
  });

  it("response 404 jika dokumen tidak ditemukan, tidak memanggil unlink", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(null);

    const req = buatRequest({ params: { id: "999" } });
    const res = buatResponse();

    await kontrol.hapusDokumen(req, res);

    expect(fs.unlink).not.toHaveBeenCalled();
    expect(repositoriMock.hapusDokumen).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "not_found" }),
    );
  });

  it("tetap menghapus dari DB meski fs.unlink gagal, response 200", async () => {
    repositoriMock.getDokumenById.mockResolvedValue(mockDokumen);
    repositoriMock.hapusDokumen.mockResolvedValue(true);
    (fs.unlink as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("ENOENT: file not found"));

    const req = buatRequest({ params: { id: "1" } });
    const res = buatResponse();

    await kontrol.hapusDokumen(req, res);

    expect(fs.unlink).toHaveBeenCalledWith(mockDokumen.path);
    expect(repositoriMock.hapusDokumen).toHaveBeenCalledWith(1n);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Dokumen berhasil dihapus" });
  });
});
