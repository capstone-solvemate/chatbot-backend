export type EditPenggunaDto = {
  nama: string;
  email: string;
  peran: number[];
  passwordBaru?: string;
  isActive: boolean;
};