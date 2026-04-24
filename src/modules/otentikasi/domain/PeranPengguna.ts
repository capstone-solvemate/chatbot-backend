export enum PeranPengguna {
  Karyawan,
  Admin,
}

export function peranPenggunaToInt(peran: PeranPengguna): number {
  switch (peran) {
    case PeranPengguna.Karyawan:
      return 1;
    case PeranPengguna.Admin:
      return 2;
  }
}

export function intToPeranPengguna(value: number): PeranPengguna | null {
  switch (value) {
    case 1:
      return PeranPengguna.Karyawan;
    case 2:
      return PeranPengguna.Admin;
    default:
      return null;
  }
}

export function peranPenggunaToString(peran: PeranPengguna): string {
  switch (peran) {
    case PeranPengguna.Karyawan:
      return "karyawan";
    case PeranPengguna.Admin:
      return "admin";
  }
}

export function stringToPeranPengguna(peranStr: string): PeranPengguna | null {
  switch (peranStr.toLowerCase()) {
    case "karyawan":
      return PeranPengguna.Karyawan;
    case "admin":
      return PeranPengguna.Admin;
    default:
      return null;
  }
}
