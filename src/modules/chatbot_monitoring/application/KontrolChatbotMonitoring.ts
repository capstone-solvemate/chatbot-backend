import type { EmailWorkerClient } from "~/modules/notifikasi/email/business/EmailWorkerClient.js";
import type { RepositoriPengguna } from "~/modules/pengguna/data/RepositoriPengguna.js";

import { ForbiddenError } from "~/core/types/ForbiddenError.js";

import type { ChatbotMonitoringPayload } from "../api/ws/payload/ChatbotMonitoringPayload.js";
import type { FilterChatbotMonitoring } from "../api/ws/payload/FilterChatbotMonitoring.js";
import type { ReportGenerator } from "../data/ReportGenerator.js";
import type { RepositoriChatbotMonitoring } from "../data/RepositoriChatbotMonitoring.js";

export class KontrolChatbotMonitoring {
  constructor(
    private readonly repositoriChatbotMonitoring: RepositoriChatbotMonitoring,
    private readonly reportGenerator: ReportGenerator,
    private readonly repositoriPengguna: RepositoriPengguna,
    private readonly emailWorkerClient: EmailWorkerClient,
  ) {}

  async buatPayloadChatbot(filter: FilterChatbotMonitoring): Promise<ChatbotMonitoringPayload> {
    const [
      totalSesi,
      totalPesan,
      unansweredQuestions,
      historyAktivitas,
      avgSesiPerJam,
    ] = await Promise.all([
      this.repositoriChatbotMonitoring.getTotalSesi(filter),
      this.repositoriChatbotMonitoring.getTotalPesan(filter),
      this.repositoriChatbotMonitoring.getUnansweredQuestions(filter),
      this.repositoriChatbotMonitoring.getHistoryAktivitas(filter),
      this.repositoriChatbotMonitoring.getAvgSesiPerJam(filter),
    ]);

    const avgPesanPerSesi = totalSesi === 0 ? 0 : Math.round((totalPesan / totalSesi) * 10) / 10;

    return {
      totalSesi,
      totalPesan,
      avgPesanPerSesi,
      unansweredQuestions,
      historyAktivitas,
      avgSesiPerJam,
      topUnansweredQuestions: null,
      filter,
    };
  }

  async kirimReport(idPengguna: number, emailTujuan: string, filter: FilterChatbotMonitoring, zonaWaktu: number): Promise<void> {
    const pengguna = await this.repositoriPengguna.getPenggunaById(idPengguna);
    if (!pengguna) {
      throw new ForbiddenError();
    }

    const [
      totalSesi,
      totalPesan,
      unansweredQuestions,
      historyAktivitas,
      avgSesiPerJam,
    ] = await Promise.all([
      this.repositoriChatbotMonitoring.getTotalSesi(filter),
      this.repositoriChatbotMonitoring.getTotalPesan(filter),
      this.repositoriChatbotMonitoring.getUnansweredQuestions(filter),
      this.repositoriChatbotMonitoring.getHistoryAktivitas(filter),
      this.repositoriChatbotMonitoring.getAvgSesiPerJam(filter),
    ]);

    const pdfBuffer = await this.reportGenerator.generatePdf({
      totalMessages: totalPesan,
      totalSessions: totalSesi,
      avgMessagesPerSessions: Math.round(totalPesan / totalSesi * 10) / 10,
      unansweredQuestions,
      historyAktivitas,
      avgSesiPerJam,
    });

    const waktuGenerate = new Date();

    this.emailWorkerClient.kirim({
      to: emailTujuan,
      subject: "Laporan Evaluasi Monitoring Chatbot",
      html: `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Laporan Monitoring Chatbot</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1f4e78; color:#ffffff; padding:24px;">
              <h2 style="margin:0;">Laporan Monitoring Chatbot</h2>
              <p style="margin:8px 0 0 0; font-size:14px;"> Periode: ${filter.bulan !== undefined ? `${filter.bulan.toString().padStart(2, "0")}-` : ""}${filter.tahun} </p>
            </td>
          </tr> <!-- Content -->
          <tr>
            <td style="padding:32px 24px; color:#333333; font-size:14px; line-height:1.6;">
              <p>Yth. Bapak/Ibu,</p>
              <p> Bersama email ini kami menyampaikan laporan monitoring chatbot yang telah dihasilkan melalui sistem.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0; width:100%; border-collapse:collapse;">
                <tr>
                  <td style="padding:10px; border:1px solid #dcdcdc; width:35%; background-color:#f8f9fa;"> Nama Pembuat
                    Laporan </td>
                  <td style="padding:10px; border:1px solid #dcdcdc;"> ${pengguna.nama} </td>
                </tr>
                <tr>
                  <td style="padding:10px; border:1px solid #dcdcdc; background-color:#f8f9fa;"> Waktu Generate </td>
                  <td style="padding:10px; border:1px solid #dcdcdc;"> ${waktuGenerate.toISOString().slice(0, 19).replace("T", " ")} </td>
                </tr>
              </table>
              <p> Laporan monitoring chatbot terlampir pada email ini untuk dapat ditinjau lebih lanjut. </p>
              <p> Apabila terdapat pertanyaan terkait isi laporan, silakan berkoordinasi dengan pegawai yang tercantum
                sebagai pembuat laporan. </p>
              <p> Terima kasih atas perhatian dan kerja samanya. </p>
              <p> Hormat kami,<br> <strong>Sistem Monitoring Chatbot</strong> </p>
            </td>
          </tr> <!-- Footer -->
          <tr>
            <td style="padding:20px 24px; background-color:#f8f9fa; color:#6b7280; font-size:12px;"> Email ini dikirim
              secara otomatis oleh sistem. Mohon tidak membalas email ini (no-reply). </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>

</html>`,
      lampiran: [{
        filename: `report-${waktuGenerate.toISOString().slice(0, 19).replace("T", "-")}.pdf`,
        data: pdfBuffer,
        contentType: "application/pdf",
      }],
    });
  }
}
