export type PayloadWsObjekPesanChat = {
  id: string;
  pesan: string;
  tanggalDibuat: string;
  chatAsisten: boolean;
  gagal: boolean;
  daftarLampiran: {
    id: string;
  }[];
};
