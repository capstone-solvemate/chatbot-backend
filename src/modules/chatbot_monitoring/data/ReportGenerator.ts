import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

import type { HistoryItem } from "~/modules/dashboard/domain/DashboardPayload";

export class ReportGenerator {
  private static readonly INTER_REGULAR_FONT_PATH = path.resolve(process.cwd(), "fonts", "Inter-Regular.ttf");
  private static readonly INTER_SEMIBOLD_FONT_PATH = path.resolve(process.cwd(), "fonts", "Inter-SemiBold.ttf");

  constructor() {}

  private drawMetricCard(
    doc: PDFKit.PDFDocument,
    options: {
      x: number;
      y: number;
      width: number;
      height: number;
      title: string;
      value: string | number;
      description: string;
      interRegularFontExists: boolean;
      interSemiBoldFontExists: boolean;
    },
  ): void {
    const {
      x,
      y,
      width,
      height,
      title,
      value,
      description,
      interRegularFontExists,
      interSemiBoldFontExists,
    } = options;

    const padding = 16;

    // Card background
    doc
      .roundedRect(x, y, width, height, 10)
      .lineWidth(1)
      .fillAndStroke("#FFFFFF", "#E5E7EB");

    // Title
    if (interRegularFontExists) {
      doc
        .font("Inter");
    }
    doc
      .fontSize(11)
      .fillColor("#4B5563")
      .text(title, x + padding, y + padding, {
        width: width - padding * 2,
      });

    // Value
    if (interSemiBoldFontExists) {
      doc
        .font("Inter-SemiBold");
    }
    doc
      .fontSize(28)
      .fillColor("#111827")
      .text(String(value), x + padding, y + 48);

    // Description
    if (interRegularFontExists) {
      doc
        .font("Inter");
    }
    doc
      .fontSize(10)
      .fillColor("#6B7280")
      .text(
        description,
        x + padding,
        y + height - 28,
        {
          width: width - padding * 2,
        },
      );
  }

  private async generateAverageSessionChart(
    labels: string[],
    values: number[],
  ): Promise<Buffer> {
    const width = 900;
    const height = 360;

    const chart = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: "white",
    });

    return chart.renderToBuffer({
      type: "line",

      data: {
        labels,

        datasets: [
          {
            label: "Average number of sessions",

            data: values,

            borderColor: "#2563EB",
            backgroundColor: "#2563EB",

            borderWidth: 2,

            pointRadius: 4,
            pointHoverRadius: 4,

            pointBackgroundColor: "#2563EB",
            pointBorderColor: "#2563EB",

            tension: 0,
          },
        ],
      },

      options: {
        responsive: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,

            title: {
              display: true,
              text: "Average number of sessions",
            },

            grid: {
              color: "#E5E7EB",
            },

            ticks: {
              stepSize: 2,
            },
          },

          x: {
            title: {
              display: true,
              text: "Time period",
            },

            grid: {
              color: "#E5E7EB",
            },
          },
        },
      },
    });
  }

  private async generateActivityTrendsChart(labels: string[], values: number[]): Promise<Buffer> {
    const width = 900;
    const height = 360;

    const chart = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: "white",
    });

    return await chart.renderToBuffer({
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Number of Chatbot Sessions",
            data: values,

            backgroundColor: "#2563EB",
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 28,
          },
        ],
      },

      options: {
        responsive: false,

        plugins: {
          legend: {
            display: false,
          },

          title: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 40,

            title: {
              display: true,
              text: "Number of Chatbot Sessions",
            },

            ticks: {
              stepSize: 5,
            },

            grid: {
              color: "#E5E7EB",
            },
          },

          x: {
            title: {
              display: true,
              text: "Time period",
            },

            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  private drawChartCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    doc
      .roundedRect(x, y, width, height, 10)
      .lineWidth(1)
      .fillAndStroke("#FFFFFF", "#E5E7EB");
  }

  async generatePdf(data: {
    totalSessions: number;
    totalMessages: number;
    avgMessagesPerSessions: number;
    unansweredQuestions: number;
    historyAktivitas: HistoryItem[];
    avgSesiPerJam: HistoryItem[];
  }): Promise<Buffer> {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 28.35,
        bottom: 28.35,
        left: 28.35,
        right: 28.35,
      },
    });

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // check font exists
    const interRegularFontExists = fs.existsSync(ReportGenerator.INTER_REGULAR_FONT_PATH);
    const interSemiBoldFontExists = fs.existsSync(ReportGenerator.INTER_SEMIBOLD_FONT_PATH);

    // Register fonts
    if (interRegularFontExists) {
      doc.registerFont("Inter", ReportGenerator.INTER_REGULAR_FONT_PATH);
    }
    if (interSemiBoldFontExists) {
      doc.registerFont("Inter-SemiBold", ReportGenerator.INTER_SEMIBOLD_FONT_PATH);
    }

    // write title
    if (interSemiBoldFontExists) {
      doc.font("Inter-SemiBold");
    }
    doc.fontSize(22.5).text("Chatbot Monitoring");

    // make metrics data
    const metrics = [
      {
        title: "Total Sessions",
        value: data.totalSessions,
        description: "Chatbot sessions",
      },
      {
        title: "Total Messages",
        value: data.totalMessages,
        description: "Messages exchanged",
      },
      {
        title: "Avg Messages/Session",
        value: data.avgMessagesPerSessions,
        description: "Messages exchanged in each session",
      },
      {
        title: "Unanswered Questions",
        value: data.unansweredQuestions,
        description: "Requires attention",
      },
    ];

    const pageWidth = doc.page.width;
    const marginTop = doc.page.margins.top;
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;

    // write cards
    const cardsGap = 12;
    const cardHeight = 120;

    const cardWidth
      = (pageWidth - marginLeft - marginRight - cardsGap) / 2;

    const startY = doc.y + 20;

    metrics.forEach((metric, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      const x = marginLeft + col * (cardWidth + cardsGap);

      const y = startY + row * (cardHeight + cardsGap);

      this.drawMetricCard(doc, {
        x,
        y,
        width: cardWidth,
        height: cardHeight,
        interRegularFontExists,
        interSemiBoldFontExists,
        ...metric,
      });
    });

    // write charts
    const chartWidth = (pageWidth - marginLeft - marginRight);
    const chartHeight = 360;
    const chartHeaderHeight = 60;

    const activityTrendschartBuffer = await this.generateActivityTrendsChart(
      data.historyAktivitas.map(item => item.label),
      data.historyAktivitas.map(item => item.jumlah),
    );

    const chartY = startY + (cardHeight + cardsGap) * 2 + 30;
    const chartX = marginLeft;
    this.drawChartCard(doc, chartX, chartY, chartWidth, chartHeight);

    doc
      .font("Inter-SemiBold")
      .fontSize(14)
      .fillColor("#111827")
      .text(
        "Activity Trends",
        chartX + 20,
        chartY + 18,
      );

    doc
      .font("Inter")
      .fontSize(10)
      .fillColor("#6B7280")
      .text(
        "Number of Chatbot Sessions",
        chartX + 20,
        chartY + 40,
      );

    doc.image(
      activityTrendschartBuffer,
      chartX + 5,
      chartY + chartHeaderHeight,
      {
        fit: [
          chartWidth - 10,
          chartHeight - chartHeaderHeight - 15,
        ],

        align: "center",
      },
    );

    // new page
    doc.addPage();

    // write average
    let timezoneFixedAvg = [...data.avgSesiPerJam];
    for (const avg of timezoneFixedAvg) {
      const jam = Number(avg.label);
      if (!Number.isNaN(jam)) {
        const fixedJam = (jam + 7) % 24;
        avg.label = String(fixedJam).padStart(2, "0");
      }
    }
    timezoneFixedAvg = timezoneFixedAvg.sort(
      (a, b) => Number(a.label) - Number(b.label),
    );

    const tickLabels = timezoneFixedAvg.map((item, i) =>
      i % 3 === 0 ? `${item.label}:00` : "",
    );

    const chartBufferAvg = await this.generateAverageSessionChart(
      tickLabels,
      timezoneFixedAvg.map(item => item.jumlah),
    );

    const avgChartX = marginLeft;
    const avgChartY = marginTop; // atau doc.y

    this.drawChartCard(
      doc,
      avgChartX,
      avgChartY,
      chartWidth,
      chartHeight,
    );

    doc
      .font(interSemiBoldFontExists ? "Inter-SemiBold" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor("#111827")
      .text(
        "Average Session per Hour",
        avgChartX + 20,
        avgChartY + 20,
      );

    doc
      .font(interRegularFontExists ? "Inter" : "Helvetica")
      .fontSize(10)
      .fillColor("#6B7280")
      .text(
        "Average number session at each hour of the day.",
        avgChartX + 20,
        avgChartY + 42,
      );

    doc.image(
      chartBufferAvg,
      avgChartX + 5,
      avgChartY + chartHeaderHeight,
      {
        fit: [
          chartWidth - 10,
          chartHeight - chartHeaderHeight - 15,
        ],
        align: "center",
      },
    );

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      doc.end();
    });

    return pdfBuffer;
  }
}
