import type Mail from "nodemailer/lib/mailer/index.js";

import nodemailer from "nodemailer";

import type { EmailConfig } from "~/core/config/domain/EmailConfig.js";

import type { PesanEmail } from "../domain/PesanEmail.js";

import { apakahLayakRetry, EmailWorkerError, klasifikasiErrorEmail } from "../domain/EmailWorkerError.js";

export class KirimEmail {
  private readonly transporter: Mail;
  private readonly from: string;

  constructor(config: EmailConfig) {
    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  /**
   * Kirim email dengan retry sekali jika gagal (kecuali error yang tidak layak di-retry).
   * Setiap kegagalan di-log ke console.
   */
  async kirim(pesan: PesanEmail): Promise<void> {
    try {
      await this.kirimSekali(pesan);
    }
    catch (err) {
      const error = err instanceof EmailWorkerError
        ? err
        : klasifikasiErrorEmail(err, pesan.to);

      console.error(
        new Date().toISOString(),
        `[EmailWorker] Percobaan pertama gagal. Alasan: ${error.alasan}. ${error.message}`,
      );

      if (!apakahLayakRetry(error.alasan)) {
        console.error(
          new Date().toISOString(),
          `[EmailWorker] Tidak di-retry karena alasan: ${error.alasan}. Email ke "${pesan.to}" dibatalkan.`,
        );
        return;
      }

      // Retry sekali
      try {
        console.warn(
          new Date().toISOString(),
          `[EmailWorker] Mencoba retry kirim email ke "${pesan.to}"...`,
        );
        await this.kirimSekali(pesan);
        console.log(
          new Date().toISOString(),
          `[EmailWorker] Retry berhasil. Email ke "${pesan.to}" terkirim.`,
        );
      }
      catch (errRetry) {
        const errorRetry = errRetry instanceof EmailWorkerError
          ? errRetry
          : klasifikasiErrorEmail(errRetry, pesan.to);

        console.error(
          new Date().toISOString(),
          `[EmailWorker] Retry juga gagal. Alasan: ${errorRetry.alasan}. ${errorRetry.message}`,
        );
      }
    }
  }

  private async kirimSekali(pesan: PesanEmail): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: pesan.to,
        subject: pesan.subject,
        html: pesan.html,
        attachments: pesan.lampiran?.map(lpr => ({
          filename: lpr.filename,
          content: lpr.data,
          contentType: lpr.contentType,
        })),
      });

      console.log(
        new Date().toISOString(),
        `[EmailWorker] Email berhasil dikirim ke "${pesan.to}". Subject: "${pesan.subject}".`,
      );
    }
    catch (err) {
      throw klasifikasiErrorEmail(err, pesan.to);
    }
  }
}
