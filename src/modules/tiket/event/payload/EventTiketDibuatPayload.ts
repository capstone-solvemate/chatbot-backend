export type EventTiketDibuatPayload = {
  idTiket: bigint;
  idPengguna: number; // karyawan yang membuat tiket
  judul: string;
};
