import { z } from "zod";

import { ValidationError } from "~/core/types/ValidationError.js";

// --- Schema ---

const PertanyaanSchema = z.object({
  pesan: z.string().min(1, "Pesan tidak boleh kosong"),
  lampiranIds: z.array(z.string()).optional().default([]),
});

const BalasChatSchema = z.object({
  pesan: z.string().min(1, "Pesan tidak boleh kosong"),
  lampiranIds: z.array(z.string()).optional().default([]),
});

// --- DTO types ---

export type PertanyaanDto = z.infer<typeof PertanyaanSchema>;
export type BalasChatDto = z.infer<typeof BalasChatSchema>;

// --- Validators ---

export function validasiPertanyaan(body: unknown): PertanyaanDto {
  const result = PertanyaanSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map(err => ({
        field: err.path.join("."),
        error: err.code,
        message: err.message,
      })),
    );
  }
  return result.data;
}

export function validasiBalasChat(body: unknown): BalasChatDto {
  const result = BalasChatSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map(err => ({
        field: err.path.join("."),
        error: err.code,
        message: err.message,
      })),
    );
  }
  return result.data;
}
