/**
 * Alasan kegagalan pengiriman email.
 * Digunakan untuk menentukan apakah perlu retry atau tidak.
 */
export enum AlasanGagalEmail {
  /**
   * Alamat email penerima tidak ditemukan / tidak valid.
   * Tidak perlu di-retry karena hasilnya pasti sama.
   */
  PenggunaTidakDitemukan = "PENGGUNA_TIDAK_DITEMUKAN",

  /**
   * Koneksi ke SMTP server gagal atau timeout.
   * Layak di-retry.
   */
  KoneksiGagal = "KONEKSI_GAGAL",

  /**
   * Autentikasi ke SMTP server gagal.
   * Tidak layak di-retry (masalah konfigurasi).
   */
  AuthGagal = "AUTH_GAGAL",

  /**
   * Error tidak dikenal.
   * Di-retry sekali untuk jaga-jaga.
   */
  TidakDikenal = "TIDAK_DIKENAL",
}

export class EmailWorkerError extends Error {
  constructor(
    public readonly alasan: AlasanGagalEmail,
    public readonly pesanAsli: string,
    public readonly to: string,
  ) {
    super(`Gagal kirim email ke "${to}": ${pesanAsli}`);
    this.name = "EmailWorkerError";
  }
}

/**
 * Mengklasifikasikan error mentah dari Nodemailer
 * menjadi AlasanGagalEmail yang dapat diambil keputusannya.
 */
export function klasifikasiErrorEmail(err: unknown, to: string): EmailWorkerError {
  if (!(err instanceof Error)) {
    return new EmailWorkerError(AlasanGagalEmail.TidakDikenal, String(err), to);
  }

  const pesan = err.message.toLowerCase();
  const kode = (err as any).code as string | undefined;
  const responseCode = (err as any).responseCode as number | undefined;

  // Penerima tidak ditemukan: SMTP 550/551/553 atau pesan "user not found", "no such user", dst.
  const kodeUserTidakAda = [550, 551, 553];
  const kataTidakAda = ["user not found", "no such user", "user unknown", "address rejected", "invalid mailbox", "does not exist"];
  if (
    (responseCode !== undefined && kodeUserTidakAda.includes(responseCode))
    || kataTidakAda.some(kata => pesan.includes(kata))
  ) {
    return new EmailWorkerError(AlasanGagalEmail.PenggunaTidakDitemukan, err.message, to);
  }

  // Auth gagal: SMTP 535 atau kode EAUTH
  if (responseCode === 535 || kode === "EAUTH") {
    return new EmailWorkerError(AlasanGagalEmail.AuthGagal, err.message, to);
  }

  // Koneksi gagal: ETIMEDOUT, ECONNREFUSED, ECONNRESET, ENOTFOUND
  const kodeKoneksi = ["ETIMEDOUT", "ECONNREFUSED", "ECONNRESET", "ENOTFOUND"];
  if (kode !== undefined && kodeKoneksi.includes(kode)) {
    return new EmailWorkerError(AlasanGagalEmail.KoneksiGagal, err.message, to);
  }

  return new EmailWorkerError(AlasanGagalEmail.TidakDikenal, err.message, to);
}

/**
 * Menentukan apakah error ini layak di-retry.
 * Hanya PenggunaTidakDitemukan dan AuthGagal yang tidak di-retry
 * karena retry tidak akan mengubah hasilnya.
 */
export function apakahLayakRetry(alasan: AlasanGagalEmail): boolean {
  switch (alasan) {
    case AlasanGagalEmail.PenggunaTidakDitemukan:
    case AlasanGagalEmail.AuthGagal:
      return false;
    case AlasanGagalEmail.KoneksiGagal:
    case AlasanGagalEmail.TidakDikenal:
      return true;
  }
}
