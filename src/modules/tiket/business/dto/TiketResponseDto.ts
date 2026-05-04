export type TiketResponseDto = {
  id: string;
  judul: string;
  deskripsi: string;
  idPembuat: number;
  namaPembuat: string;
  idChat: string;
  idKategori: number;
  status: string;
  dibuatPada: string;
  diperbaruiPada: string;
};

export type TiketDetailResponseDto = TiketResponseDto & {
  pesanTiket: PesanTiketResponseDto[];
};

export type PesanTiketResponseDto = {
  id: string;
  idTiket: string;
  idPembuat: number;
  pesan: string;
  dibuatPada: string;
};
