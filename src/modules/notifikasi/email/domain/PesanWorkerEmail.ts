import type { PesanEmail } from "./PesanEmail.js";

export type PesanWorkerEmail
  = | { tipe: "kirim"; pesan: PesanEmail }
    | { tipe: "berhenti" };
