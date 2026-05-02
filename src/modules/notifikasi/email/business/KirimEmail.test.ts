/**
 * Test pengiriman email sungguhan via SMTP.
 *
 * TIDAK dijalankan secara default saat `pnpm test` karena file ini
 * berada di folder `test/real/` yang di-exclude di vitest.config.ts.
 *
 * Cara menjalankan:
 *   RUN_EMAIL_TEST=true pnpm vitest run test/real/email/KirimEmail.test.ts
 *
 * Pastikan variabel SMTP_* sudah di-set di .env atau environment sebelum menjalankan.
 */

import * as dotenv from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";

import { EmailConfig } from "~/core/config/domain/EmailConfig.js";
import { KirimEmail } from "~/modules/notifikasi/email/business/KirimEmail";

dotenv.config();

const jalankan = process.env.RUN_EMAIL_TEST === "true";

describe.skipIf(!jalankan)("KirimEmail — real SMTP", () => {
  let kirimEmail: KirimEmail;
  let testRecipient: string;

  beforeAll(() => {
    const recipient = process.env.SMTP_TEST_RECIPIENT;
    if (!recipient) {
      throw new Error(
        "SMTP_TEST_RECIPIENT belum di-set. "
        + "Tambahkan SMTP_TEST_RECIPIENT=<alamat-email> di .env sebelum menjalankan test ini.",
      );
    }
    testRecipient = recipient;

    const config = new EmailConfig(
      process.env.SMTP_HOST || "",
      Number.parseInt(process.env.SMTP_PORT || "587"),
      process.env.SMTP_SECURE === "true",
      process.env.SMTP_USER || "",
      process.env.SMTP_PASSWORD || "",
      process.env.SMTP_FROM || "",
    );
    kirimEmail = new KirimEmail(config);
  });

  it("berhasil mengirim email status tiket berubah", async () => {
    await expect(
      kirimEmail.kirim({
        to: testRecipient,
        subject: "[Test] Status tiket diperbarui",
        html: `
          <p>Ini adalah email test untuk <strong>perubahan status tiket</strong>.</p>
          <p>Dikirim pada: ${new Date().toISOString()}</p>
        `,
      }),
    ).resolves.not.toThrow();
  });

  it("berhasil mengirim email balasan tiket baru", async () => {
    await expect(
      kirimEmail.kirim({
        to: testRecipient,
        subject: "[Test] Ada balasan baru pada tiket",
        html: `
          <p>Ini adalah email test untuk <strong>balasan tiket baru</strong>.</p>
          <p>Dikirim pada: ${new Date().toISOString()}</p>
        `,
      }),
    ).resolves.not.toThrow();
  });
});
