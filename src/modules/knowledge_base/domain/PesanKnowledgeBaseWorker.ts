/**
 * Pesan dari main thread → worker thread.
 */
export type PesanProsesKnowledgeBase = {
  tipe: "proses";
  idDokumen: string; // BigInt diserialisasi ke string — postMessage tidak support BigInt
  docId: string;
  namaBerkas: string;
  path: string;
};

export type PesanBerhentiKnowledgeBase = {
  tipe: "berhenti";
};

export type PesanKeWorker
  = | PesanProsesKnowledgeBase
    | PesanBerhentiKnowledgeBase;

/**
 * Pesan dari worker thread → main thread.
 */
export type PesanMulaiKnowledgeBase = {
  tipe: "mulai";
  idDokumen: string; // worker memberi tahu dokumen mana yang mulai diproses
};

export type PesanSelesDiKnowledgeBase = {
  tipe: "selesai";
  idDokumen: string;
};

export type PesanGagalKnowledgeBase = {
  tipe: "gagal";
  idDokumen: string;
  errorCode: string;
};

export type PesanDariWorker
  = | PesanMulaiKnowledgeBase
    | PesanSelesDiKnowledgeBase
    | PesanGagalKnowledgeBase;
