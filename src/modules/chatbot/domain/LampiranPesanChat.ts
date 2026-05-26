export class LampiranPesanChat {
  constructor(
    public id: bigint,
    public idPesanChat: bigint,
    public namaBerkas: string,
    public path: string,
    public ukuran: bigint,
  ) {
    if (namaBerkas.length > 100) {
      throw new Error(`Panjang 'namaBerkas' pada class 'LampiranPesanChat' harus kurang dari 100 karakter. Panjang terdeteksi: ${namaBerkas.length}.`);
    }
  }
}
