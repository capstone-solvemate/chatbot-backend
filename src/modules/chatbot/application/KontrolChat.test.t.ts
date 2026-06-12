// import sharp from "sharp";
// import { describe, expect, it, vi } from "vitest";

// import type { RepositoriLampiran } from "~/modules/upload/data/RepositoriLampiran.js";

// import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";
// import { mockRepositoriLampiran } from "~/modules/upload/data/RepositoriLampiranStub.js";
// import { mockExpressRequest, mockExpressResponse } from "~test/stub/ExpressStub.js";
// import { mockWs } from "~test/stub/WsStub.js";

// import type { ManajerWsChat } from "../api/ws/ManajerWsChat.js";
// import type { RepositoriChat } from "../data/RepositoriChat.js";
// import type { ChatEventBus } from "../event/ChatEventBus.js";
// import type { RagWorkerClient } from "./RagWorkerClient.js";

// import { mockManajerWsChat } from "../api/ws/ManajerWsChatStub.js";
// import { mockRepositoriChat } from "../data/RepositoriChatStub.js";
// import { mockChatEventBus } from "../event/ChatEventBusStub.js";
// import { KontrolChat } from "./KontrolChat.js";
// import { mockRagWorkerClient } from "./RagWorkerClientStub.js";

// function buatKontrolChat(deps: {
//   repositoriChat?: RepositoriChat;
//   manajerWsChat?: ManajerWsChat;
//   ragWorkerClient?: RagWorkerClient;
//   chatEventBus?: ChatEventBus;
//   repositoriLampiran?: RepositoriLampiran;
// } = {}): KontrolChat {
//   return new KontrolChat(
//     deps.repositoriChat ?? mockRepositoriChat(),
//     deps.manajerWsChat ?? mockManajerWsChat(),
//     deps.ragWorkerClient ?? mockRagWorkerClient(),
//     deps.chatEventBus ?? mockChatEventBus(),
//     deps.repositoriLampiran ?? mockRepositoriLampiran(),
//   );
// }

// describe("KontrolChat", () => {
//   describe("fungsi buatChat", () => {
//     const contohBodyBuatChat = {
//       idKoneksiWs: "00000000-0000-0000-0000-000000000002",
//       pesan: "how to resolve paper jam?",
//     };

//     it("harus memberi pesan error jika gambar yang diunggah berdimensi lebih dari 2048px", async () => {
//       const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
//       req.body = contohBodyBuatChat;
//       const res = mockExpressResponse();

//       const contohGambarMelebihiBatasan = await sharp({
//         create: {
//           width: 2049,
//           height: 1024,
//           channels: 3,
//           background: { r: 255, g: 255, b: 255 },
//         },
//       })
//         .jpeg()
//         .toBuffer();

//       req.files = [
//         {
//           buffer: contohGambarMelebihiBatasan,
//           mimetype: "image/jpeg",
//           originalname: "test-2049x1024.jpg",
//           fieldname: "files",
//           encoding: "7bit",
//           size: contohGambarMelebihiBatasan.length,
//         } as Express.Multer.File,
//       ];

//       const kontrol = buatKontrolChat();

//       await expect(kontrol.buatChat(req, res)).rejects.toThrow();
//     });

//     it("harus memanggil fungsi 'buatChat' class 'RepositoriChat'", async () => {
//       const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
//       req.body = contohBodyBuatChat;
//       const res = mockExpressResponse();

//       const repositoriChat = mockRepositoriChat();

//       const kontrol = buatKontrolChat({
//         repositoriChat,
//       });

//       await kontrol.buatChat(req, res);

//       expect(repositoriChat.buatChat).toHaveBeenCalledOnce();
//     });

//     it("harus mencantumkan objek Chat dengan subjek sesuai input pada parameter pemanggilan fungsi 'buatChat' class 'RepositoriChat'", async () => {
//       const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
//       req.body = contohBodyBuatChat;
//       const res = mockExpressResponse();

//       const repositoriChat = mockRepositoriChat();

//       const kontrol = buatKontrolChat({
//         repositoriChat,
//       });

//       await kontrol.buatChat(req, res);

//       expect(repositoriChat.buatChat).toHaveBeenCalledWith(
//         expect.objectContaining({
//           subjek: contohBodyBuatChat.pesan,
//         }),
//       );
//     });

//     it("harus mencantumkan objek Chat dengan subjek yang telah dipotong jika jumlah karakter input melebihi batas pada parameter pemanggilan fungsi 'buatChat' class 'RepositoriChat'", async () => {
//       const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
//       req.body = {
//         idKoneksiWs: contohBodyBuatChat.idKoneksiWs,
//         pesan: Array.from({ length: 51 }).fill("b").join(""),
//       };
//       const res = mockExpressResponse();

//       const repositoriChat = mockRepositoriChat();

//       const kontrol = buatKontrolChat({
//         repositoriChat,
//       });

//       await kontrol.buatChat(req, res);

//       const ekspektasiSubjek = `${Array.from({ length: 47 }).fill("b").join("")}...`;

//       expect(repositoriChat.buatChat).toHaveBeenCalledWith(
//         expect.objectContaining({
//           subjek: ekspektasiSubjek,
//         }),
//       );
//     });

//     it("harus memanggil fungsi 'buatPesanChat' class 'RepositoriChat'", async () => {
//       const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
//       req.body = contohBodyBuatChat;
//       const res = mockExpressResponse();

//       const repositoriChat = mockRepositoriChat();

//       const kontrol = buatKontrolChat({
//         repositoriChat,
//       });

//       await kontrol.buatChat(req, res);

//       expect(repositoriChat.buatPesanChat).toHaveBeenCalledOnce();
//     });

//     it("harus mencantumkan objek PesanChat yang sesuai input pada parameter pemanggilan fungsi 'buatPesanChat' class 'RepositoriChat'", async () => {
//       const req = mockExpressRequest({ peranPengguna: PeranPengguna.Karyawan });
//       req.body = contohBodyBuatChat;
//       const res = mockExpressResponse();

//       const repositoriChat = mockRepositoriChat();

//       const kontrol = buatKontrolChat({
//         repositoriChat,
//       });

//       await kontrol.buatChat(req, res);

//       expect(repositoriChat.buatPesanChat).toHaveBeenCalledWith(
//         expect.objectContaining({
//           pesan: contohBodyBuatChat.pesan,
//         }),
//       );
//     });
//   });

//   describe("fungsi listenPesanChatBaru", () => {
//     it("harus memanggil fungsi 'tambahKoneksiPesanBaru' class 'ManajerWsChat'", async () => {
//       const manajerWsChat = mockManajerWsChat({
//         tambahKoneksiPesanBaru: vi.fn().mockReturnValue(""),
//       });

//       const kontrolChat = buatKontrolChat({ manajerWsChat });

//       const ws = mockWs();
//       const idSession = "00000000-0000-0000-0000-000000000001";

//       await kontrolChat.listenPesanChatBaru(ws, idSession);

//       expect(manajerWsChat.tambahKoneksiPesanBaru).toHaveBeenCalledOnce();
//     });

//     it("harus mengembalikan id koneksi yang dihasilkan fungsi 'tambahKoneksiPesanBaru' class 'ManajerWsChat'", async () => {
//       const idKoneksi = "e09d446d-bb67-446c-82c5-cbb390a3e09f";

//       const manajerWsChat = mockManajerWsChat({
//         tambahKoneksiPesanBaru: vi.fn().mockReturnValue(idKoneksi),
//       });

//       const kontrolChat = buatKontrolChat({ manajerWsChat });

//       const ws = mockWs();
//       const idSession = "00000000-0000-0000-0000-000000000001";

//       const hasil = await kontrolChat.listenPesanChatBaru(ws, idSession);

//       expect(hasil).toBe(idKoneksi);
//     });
//   });
// });
