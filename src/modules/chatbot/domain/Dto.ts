import { z } from "zod";

import { ValidationError } from "~/core/types/ValidationError.js";

import type { PayloadWsBuatChat } from "../api/ws/dto/PayloadWsBuatChat.js";

// --- Schema ---

const PertanyaanSchema = z.object({
  pesan: z.string().min(1, "Pesan tidak boleh kosong"),
});

// --- DTO types ---

export type PertanyaanDto = z.infer<typeof PertanyaanSchema>;

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

export function validasiBalasChat(body: PayloadWsBuatChat) {
  if (body.pesan.trim() === "" && body.daftarLampiran.length === 0) {
    throw new ValidationError([{
      field: "pesan",
      error: "required",
      message: "field 'pesan' required",
    }]);
  }
}
