export type StatusDokumen = "BelumDiproses" | "SedangDiproses" | "SelesaiDiproses";

export type KnowledgeBase = {
  id: bigint;
  doc_id: string;
  nama_berkas: string;
  path: string;
  status: StatusDokumen;
  createdAt?: Date;
  updatedAt?: Date;
};
