import * as libpath from "node:path";

export class LampiranPesanChat {
  public readonly path: string;

  constructor(
    public id: bigint,
    public readonly idPesanChat: bigint,
    public readonly namaBerkas: string,
    public readonly ukuran: bigint,
  ) {
    if (namaBerkas.length > 100) {
      throw new Error(`Panjang 'namaBerkas' pada class 'LampiranPesanChat' harus kurang dari 100 karakter. Panjang terdeteksi: ${namaBerkas.length}.`);
    }

    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const storedFileName = uniquePrefix + libpath.extname(namaBerkas).toLowerCase();
    this.path = `uploads/chatbot/${storedFileName}`;
  }
}
