import type { Buffer } from "node:buffer";

export type PesanEmail = {
  to: string;
  subject: string;
  html: string;
  lampiran?: {
    contentType: string;
    filename: string;
    data: Buffer;
  }[];
};
