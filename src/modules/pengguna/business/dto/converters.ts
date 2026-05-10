import type { PenggunaResponseDto } from "./PenggunaResponseDto.js";
import type { TambahPenggunaDto } from "./TambahPenggunaDto.js";

import { Pengguna } from "../../domain/Pengguna.js";
import { intToPeranPengguna, PeranPengguna, peranPenggunaToInt } from "../../domain/PeranPengguna.js";

export function tambahPenggunaDtoToPengguna(dto: TambahPenggunaDto): Pengguna {
  return new Pengguna(
    0,
    dto.nama,
    dto.email,
    dto.password,
    dto.peran.map(peranInt => (intToPeranPengguna(peranInt) || PeranPengguna.Karyawan)),
    true,
  );
}

export function penggunaToDto(pengguna: Pengguna): PenggunaResponseDto {
  return {
    id: pengguna.id,
    nama: pengguna.nama,
    email: pengguna.email,
    peran: pengguna.peran.map(peran => peranPenggunaToInt(peran)),
    isActive: pengguna.isActive,
  };
}
