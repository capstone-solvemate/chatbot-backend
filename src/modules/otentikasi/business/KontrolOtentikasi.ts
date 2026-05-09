import type { Request, Response } from "express";

import * as bcrypt from "bcrypt";
import * as uuid from "uuid";

import type { RepositoriPengguna } from "~/modules/pengguna/data/RepositoriPengguna.js";

import { InvalidCsrfToken } from "~/core/types/InvalidCsrfTokenError.js";
import { TooManyRequestsError } from "~/core/types/TooManyRequestsError.js";
import { ValidationError } from "~/core/types/ValidationError.js";
import { WsSessionRegistry } from "~/core/ws/WsSessionRegistry.js";
import { DI } from "~/di/DI.js";

import type { RepositoriResetPassword } from "../data/RepositoriResetPassword.js";
import type { InfoPenggunaDto } from "./InfoPenggunaDto.js";
import type { RepositoriSession } from "./RepositoriSession.js";

import { UnauthenticatedError, UnauthenticatedReason } from "../../../core/types/UnauthenticatedError.js";
import { PeranPengguna, peranPenggunaToString } from "../../pengguna/domain/PeranPengguna.js";
import { CSRF_TOKEN_COOKIE_KEY, SESSION_COOKIE_KEY } from "../domain/constants.js";
import { Session } from "../domain/Session.js";
import { validasiLogin, validasiMintaOtp, validasiSimpanPassword, validasiVerifikasiOtp } from "./validators.js";

export class KontrolOtentikasi {
  constructor(
    private readonly repositoriPengguna: RepositoriPengguna,
    private readonly repositoriSession: RepositoriSession,
    private readonly repositoriResetPassword: RepositoriResetPassword,
  ) {}

  private readonly emailWorkerClient = DI.provideEmailWorkerClient();

  private readonly OTP_EXPIRY_MENIT = 10;
  private readonly RESET_TOKEN_EXPIRY_MENIT = 15;
  private readonly MAKS_PERCOBAAN_SALAH = 3;
  private readonly BCRYPT_SALT_ROUNDS = 12;

  async loginKaryawan(req: Request, res: Response): Promise<void> {
    await this.login(req, res, PeranPengguna.Karyawan);
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    await this.login(req, res, PeranPengguna.Admin);
  }

  private async login(req: Request, res: Response, peran: PeranPengguna): Promise<void> {
    const loginDto = validasiLogin(req);
    const pengguna = await this.repositoriPengguna.getPenggunaByEmail(loginDto.email);
    if (!pengguna) {
      throw new UnauthenticatedError(UnauthenticatedReason.UserNotFound, loginDto.email);
    }
    if (!await bcrypt.compare(loginDto.password, pengguna.password)) {
      throw new UnauthenticatedError(UnauthenticatedReason.InvalidPassword, loginDto.email);
    }

    if (!pengguna.peran.includes(peran)) {
      throw new UnauthenticatedError(UnauthenticatedReason.InvalidRole, loginDto.email);
    }

    await this.repositoriSession.updatePenggunaTerotentikasi(req.sesiPengguna!.sessionId, {
      idPengguna: pengguna.id,
      peran,
    });

    res.sendStatus(204);
  }

  async getInfoPengguna(req: Request, res: Response): Promise<void> {
    const pengguna = await this.repositoriPengguna.getPenggunaById(req.sesiPengguna!.idPengguna!);
    if (pengguna === null) {
      throw new UnauthenticatedError(
        UnauthenticatedReason.UserNotFound,
        undefined,
        req.sesiPengguna!.idPengguna!,
      );
    }
    const resp: InfoPenggunaDto = {
      id: pengguna.id,
      nama: pengguna.nama,
      peran: peranPenggunaToString(req.sesiPengguna!.peranPengguna!),
    };
    res.json(resp);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const idSession = req.sesiPengguna!.sessionId;
    await this.repositoriSession.updatePenggunaTerotentikasi(idSession, null);

    // Invalidasi semua koneksi WS aktif milik session ini
    // (chat, dashboard, dan WS lain yang terdaftar di WsSessionRegistry)
    WsSessionRegistry.instance.invalidasiSession(idSession);

    res.sendStatus(204);
  }

  async tanganiSessionTidakValid(req: Request, res: Response): Promise<void> {
    const session = new Session(
      "",
      null,
      null,
      uuid.v4().toString(),
      req.headers["user-agent"] || null,
      new Date(),
    );
    await this.repositoriSession.buatSession(session);

    res.cookie(SESSION_COOKIE_KEY, session.id, {
      httpOnly: true,
      path: "/api",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie(CSRF_TOKEN_COOKIE_KEY, session.csrfToken, {
      httpOnly: false,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    throw new InvalidCsrfToken();
  }

  tanganiCsrfTidakValid(req: Request, res: Response): void {
    res.cookie(CSRF_TOKEN_COOKIE_KEY, req.sesiPengguna!.csrfToken, {
      httpOnly: false,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    throw new InvalidCsrfToken();
  }

  private hasilkanOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private tambahMenit(date: Date, menit: number): Date {
    return new Date(date.getTime() + menit * 60 * 1000);
  }

  async mintaOtp(req: Request, res: Response): Promise<void> {
    const dto = validasiMintaOtp(req);

    const pengguna = await this.repositoriPengguna.getPenggunaByEmail(dto.email, false);
    if (!pengguna) {
      res.sendStatus(204);
      return;
    }

    const existing = await this.repositoriResetPassword.getByEmail(dto.email);
    const sekarang = new Date();

    let jumlahPermintaan = 1;
    let permintaanPertamaPada = sekarang;

    if (existing) {
      const masihDalamWindow = existing.dalamJendalaThrottle();

      if (masihDalamWindow) {
        if (existing.sudahMelebihiMaksPermintaan()) {
          throw new TooManyRequestsError("terlalu banyak permintaan OTP. Coba lagi dalam 2 menit.");
        }
        jumlahPermintaan = existing.jumlahPermintaan + 1;
        permintaanPertamaPada = existing.permintaanPertamaPada!;
      }
    }

    const otp = this.hasilkanOtp();
    const otpExpiredPada = this.tambahMenit(sekarang, this.OTP_EXPIRY_MENIT);

    await this.repositoriResetPassword.upsertPermintaanOtp({
      email: dto.email,
      otp,
      otpExpiredPada,
      jumlahPermintaan,
      permintaanPertamaPada,
    });

    this.emailWorkerClient.kirim({
      to: dto.email,
      subject: "Kode OTP Reset Password",
      html: `
        <p>Halo <strong>${pengguna.nama}</strong>,</p>
        <p>Kode OTP reset password kamu adalah:</p>
        <h2 style="letter-spacing: 8px;">${otp}</h2>
        <p>Kode ini berlaku selama <strong>${this.OTP_EXPIRY_MENIT} menit</strong>.</p>
        <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
      `,
    });

    res.sendStatus(204);
  }

  async verifikasiOtp(req: Request, res: Response): Promise<void> {
    const dto = validasiVerifikasiOtp(req);

    const data = await this.repositoriResetPassword.getByEmail(dto.email);

    if (!data || !data.otp) {
      throw new ValidationError([{
        field: "otp",
        error: "invalid_otp",
        message: "OTP tidak valid atau sudah kedaluwarsa.",
      }]);
    }

    if (data.sudahMelebihiMaksPercobaanSalah()) {
      throw new ValidationError([{
        field: "otp",
        error: "otp_locked",
        message: "OTP terkunci karena terlalu banyak percobaan salah. Minta OTP baru.",
      }]);
    }

    if (!data.otpMasihBerlaku()) {
      throw new ValidationError([{
        field: "otp",
        error: "otp_expired",
        message: "OTP sudah kedaluwarsa. Minta OTP baru.",
      }]);
    }

    if (data.otp !== dto.otp) {
      await this.repositoriResetPassword.incrementPercobaanSalah(dto.email);

      const sisaPercobaan = this.MAKS_PERCOBAAN_SALAH - (data.percobaanSalah + 1);
      throw new ValidationError([{
        field: "otp",
        error: "wrong_otp",
        message: `OTP salah. Sisa percobaan: ${sisaPercobaan}.`,
      }]);
    }

    const resetToken = uuid.v4().toString();
    const resetTokenExpiredPada = this.tambahMenit(new Date(), this.RESET_TOKEN_EXPIRY_MENIT);

    await this.repositoriResetPassword.updateSetelahOtpVerified(dto.email, resetToken, resetTokenExpiredPada);

    res.json({ reset_token: resetToken });
  }

  async simpanPassword(req: Request, res: Response): Promise<void> {
    const dto = validasiSimpanPassword(req);

    if (dto.passwordBaru !== dto.konfirmasiPassword) {
      throw new ValidationError([{
        field: "konfirmasi_password",
        error: "password_mismatch",
        message: "konfirmasi password tidak cocok.",
      }]);
    }

    const data = await this.repositoriResetPassword.getByResetToken(dto.resetToken);

    if (!data || !data.resetToken) {
      throw new ValidationError([{
        field: "reset_token",
        error: "invalid_reset_token",
        message: "token tidak valid.",
      }]);
    }

    if (!data.resetTokenMasihBerlaku()) {
      throw new ValidationError([{
        field: "reset_token",
        error: "reset_token_expired",
        message: "token sudah kedaluwarsa. Ulangi proses reset password.",
      }]);
    }

    const passwordHash = await bcrypt.hash(dto.passwordBaru, this.BCRYPT_SALT_ROUNDS);

    await this.repositoriPengguna.updatePassword(data.email, passwordHash);

    await this.repositoriResetPassword.hapusByEmail(data.email);

    res.sendStatus(204);
  }
}
