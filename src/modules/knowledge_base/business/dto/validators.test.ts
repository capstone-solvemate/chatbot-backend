// src/modules/knowledge_base/business/dto/validators.test.ts
import type { Request } from "express";

import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";

import { ValidationError } from "~/core/types/ValidationError.js";

import { validasiUploadDokumen } from "./validators.js";

function buatFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: "file",
    originalname: "dokumen.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    destination: "uploads/knowledge_base/",
    filename: "1234567890-dokumen.pdf",
    path: "uploads/knowledge_base/1234567890-dokumen.pdf",
    size: 1024,
    buffer: Buffer.from(""),
    stream: null as any,
    ...overrides,
  };
}

function buatRequest(body: Record<string, any>, file?: Express.Multer.File): Request {
  return { body, file } as unknown as Request;
}

describe("validasiUploadDokumen", () => {
  describe("validasi file", () => {
    it("melempar ValidationError jika tidak ada file", () => {
      const req = buatRequest({ judul: "Panduan", idKategori: "1" }, undefined);
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });

    it("ValidationError untuk file berisi field 'file'", () => {
      const req = buatRequest({ judul: "Panduan", idKategori: "1" }, undefined);
      try {
        validasiUploadDokumen(req);
      }
      catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        const err = e as ValidationError;
        expect(err.fields.some(f => f.field === "file")).toBe(true);
      }
    });
  });

  describe("validasi body", () => {
    it("melempar ValidationError jika judul kosong", () => {
      const req = buatRequest({ judul: "", idKategori: "1" }, buatFile());
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });

    it("melempar ValidationError jika judul tidak ada", () => {
      const req = buatRequest({ idKategori: "1" }, buatFile());
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });

    it("ValidationError untuk judul berisi field 'judul'", () => {
      const req = buatRequest({ idKategori: "1" }, buatFile());
      try {
        validasiUploadDokumen(req);
      }
      catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        const err = e as ValidationError;
        expect(err.fields.some(f => f.field === "judul")).toBe(true);
      }
    });

    it("melempar ValidationError jika idKategori tidak ada", () => {
      const req = buatRequest({ judul: "Panduan" }, buatFile());
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });

    it("melempar ValidationError jika idKategori bukan angka", () => {
      const req = buatRequest({ judul: "Panduan", idKategori: "bukan-angka" }, buatFile());
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });

    it("melempar ValidationError jika idKategori negatif", () => {
      const req = buatRequest({ judul: "Panduan", idKategori: "-1" }, buatFile());
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });

    it("melempar ValidationError jika idKategori nol", () => {
      const req = buatRequest({ judul: "Panduan", idKategori: "0" }, buatFile());
      expect(() => validasiUploadDokumen(req)).toThrow(ValidationError);
    });
  });

  describe("input valid", () => {
    it("mengembalikan UploadDokumenDto untuk input yang valid", () => {
      const file = buatFile();
      const req = buatRequest({ judul: "Panduan Jaringan", idKategori: "3" }, file);
      const result = validasiUploadDokumen(req);

      expect(result.judul).toBe("Panduan Jaringan");
      expect(result.idKategori).toBe(3);
      expect(result.file).toBe(file);
    });

    it("judul di-trim dari whitespace", () => {
      const req = buatRequest({ judul: "  Panduan Jaringan  ", idKategori: "3" }, buatFile());
      const result = validasiUploadDokumen(req);
      expect(result.judul).toBe("Panduan Jaringan");
    });

    it("idKategori dikonversi dari string ke number", () => {
      const req = buatRequest({ judul: "Panduan", idKategori: "5" }, buatFile());
      const result = validasiUploadDokumen(req);
      expect(result.idKategori).toBe(5);
      expect(typeof result.idKategori).toBe("number");
    });
  });
});
