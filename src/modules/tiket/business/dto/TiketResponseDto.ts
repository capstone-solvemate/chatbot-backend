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

export type TiketAdminDetailResponseDto = TiketDetailResponseDto & {
  emailPembuat: string;
  historiChat: PesanChatResponseDto[];
};

export type PesanTiketResponseDto = {
  id: string;
  idTiket: string;
  idPembuat: number;
  pesan: string;
  dibuatPada: string;
};

export type PesanChatResponseDto = {
  id: string;
  idChat: string;
  pesan: string;
  dibuatPada: string;
  dariAsisten: boolean;
};
