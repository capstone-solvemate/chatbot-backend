import { z } from "zod";
import { ValidationError } from "~/core/types/ValidationError.js";

export const PertanyaanSchema = z.object({
  idChat: z.string().optional(),
  pesan: z.string().min(1, "Pesan tidak boleh kosong"),
});

export type PertanyaanDto = z.infer<typeof PertanyaanSchema>;

export function validasiPertanyaan(body: any): PertanyaanDto {
  const result = PertanyaanSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join("."),
        error: err.code,
        message: err.message,
      }))
    );
  }
  return result.data;
}
