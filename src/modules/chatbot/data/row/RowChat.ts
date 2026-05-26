export type RowChat = {
  id: bigint;
  id_pembuat: number;
  tanggal_dibuat: Date;
  subjek: string;
  sedang_diproses: boolean;
  dialihkan_ke_tiket: boolean;
};
