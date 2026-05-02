export type StatusDokumen = 'BelumDiproses' | 'SedangDiproses' | 'SelesaiDiproses';

export interface DokumenKB {
  id: bigint;
  doc_id: string;
  nama_berkas: string;
  path: string;
  status: StatusDokumen;
  createdAt?: Date;
  updatedAt?: Date;
}
