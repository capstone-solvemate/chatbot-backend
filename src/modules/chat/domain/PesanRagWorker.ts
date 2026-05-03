export type RiwayatRag = {
  role: "user" | "assistant";
  content: string;
};

// Main thread → Worker thread
export type PesanKeWorkerRag = {
  idChat: string; // bigint tidak bisa di-postMessage, pakai string
  history: RiwayatRag[];
};

// Worker thread → Main thread
export type PesanDariWorkerRag
  = | {
    status: "ok";
    idChat: string;
    jawaban: string;
  }
  | {
    status: "error";
    idChat: string;
    pesanError: string;
  };
