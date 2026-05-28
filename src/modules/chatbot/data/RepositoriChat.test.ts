import type { Model, ModelStatic } from "sequelize";

import { describe, expect, it, vi } from "vitest";

import type { RowConverterChat } from "./row/RowConverterChat.js";

import { buatContohChat } from "../domain/ChatStub.js";
import { buatContohLampiranPesanChat } from "../domain/LampiranPesanChatStub.js";
import { buatContohPesanChat } from "../domain/PesanChatStub.js";
import { RepositoriChat } from "./RepositoriChat.js";
import { buatContohRowChat } from "./row/RowChatStub.js";
import { mockRowConverterChat } from "./row/RowConverterChatStub.js";
import { buatContohRowLampiranPesanChat } from "./row/RowLampiranPesanChatStub.js";
import { buatContohRowPesanChat } from "./row/RowPesanChatStub.js";

const mockInstanceChat = {
  toJSON: vi.fn().mockReturnValue(buatContohRowChat()),
} as unknown as Model;

function mockModelChat(customInstanceChat: Model | null = null) {
  return ({
    create: vi.fn().mockResolvedValue(customInstanceChat || mockInstanceChat),
  }) as unknown as ModelStatic<Model>;
}

const mockInstancePesanChat = {
  toJSON: vi.fn().mockReturnValue(buatContohRowPesanChat()),
} as unknown as Model;

function mockModelPesanChat(customInstancePesanChat: Model | null = null) {
  return ({
    create: vi.fn().mockResolvedValue(customInstancePesanChat || mockInstancePesanChat),
  }) as unknown as ModelStatic<Model>;
}

const mockInstanceLampiranPesanChat = {
  toJSON: vi.fn().mockReturnValue(buatContohRowPesanChat()),
} as unknown as Model;

function mockModelLampiranPesanChat(customInstanceLampiranPesanChat: Model | null = null) {
  return ({
    create: vi.fn().mockResolvedValue(customInstanceLampiranPesanChat || mockInstanceLampiranPesanChat),
  }) as unknown as ModelStatic<Model>;
}

function buatRepositoriChat(deps: {
  modelChat?: ModelStatic<Model>;
  modelPesanChat?: ModelStatic<Model>;
  modelLampiranPesanChat?: ModelStatic<Model>;
  rowConverterChat?: RowConverterChat;
} = {}): RepositoriChat {
  return new RepositoriChat(
    deps.modelChat ?? mockModelChat(),
    deps.modelPesanChat ?? mockModelPesanChat(),
    deps.modelLampiranPesanChat ?? mockModelLampiranPesanChat(),
    deps.rowConverterChat ?? mockRowConverterChat(),
  );
}

describe("RepositoriChat", () => {
  describe("fungsi buatChat", () => {
    it("harus memanggil fungsi 'chatKeRow' class 'RowConverterChat'", async () => {
      const chat = buatContohChat();

      const rowConverterChat = mockRowConverterChat();

      const repositori = buatRepositoriChat({
        rowConverterChat,
      });

      await repositori.buatChat(chat);

      expect(rowConverterChat.chatKeRow).toHaveBeenCalledOnce();
    });

    it("harus memanggil fungsi 'create' objek 'modelChat'", async () => {
      const chat = buatContohChat();

      const modelChat = mockModelChat();

      const repositori = buatRepositoriChat({
        modelChat,
      });

      await repositori.buatChat(chat);

      expect(modelChat.create).toHaveBeenCalledOnce();
    });

    it("harus memberikan parameter valid saat memanggil fungsi 'create' objek 'modelChat'", async () => {
      const chat = buatContohChat();

      const modelChat = mockModelChat();

      const repositori = buatRepositoriChat({
        modelChat,
      });

      await repositori.buatChat(chat);

      const { id, ...rowChatTanpaId } = buatContohRowChat();
      const ekspektasiParameter = rowChatTanpaId;

      expect(modelChat.create).toHaveBeenCalledWith(ekspektasiParameter);
    });

    it("harus memperbarui 'id' class 'Chat' sesuai dengan id yang dihasilkan database", async () => {
      const chat = buatContohChat();

      const mockIdChatBaru = 20n;

      const mockRowChatBaru = buatContohRowChat();
      mockRowChatBaru.id = mockIdChatBaru;
      const customInstanceChat = {
        toJSON: vi.fn().mockReturnValue(mockRowChatBaru),
      } as unknown as Model;

      const modelChat = mockModelChat(customInstanceChat);

      const repositori = buatRepositoriChat({
        modelChat,
      });

      await repositori.buatChat(chat);

      expect(chat.id).eq(mockIdChatBaru);
    });
  });

  describe("fungsi buatPesanChat", () => {
    it("harus memanggil fungsi 'pesanChatKeRow' class 'RowConverterChat'", async () => {
      const pesanChat = buatContohPesanChat();

      const rowConverterChat = mockRowConverterChat();

      const repositori = buatRepositoriChat({
        rowConverterChat,
      });

      await repositori.buatPesanChat(pesanChat);

      expect(rowConverterChat.pesanChatKeRow).toHaveBeenCalledOnce();
    });

    it("harus memanggil fungsi 'create' objek 'modelPesanChat'", async () => {
      const pesanChat = buatContohPesanChat();

      const modelPesanChat = mockModelPesanChat();

      const repositori = buatRepositoriChat({
        modelPesanChat,
      });

      await repositori.buatPesanChat(pesanChat);

      expect(modelPesanChat.create).toHaveBeenCalledOnce();
    });

    it("harus memberikan parameter valid saat memanggil fungsi 'create' objek 'modelPesanChat'", async () => {
      const pesanChat = buatContohPesanChat();

      const modelPesanChat = mockModelPesanChat();

      const repositori = buatRepositoriChat({
        modelPesanChat,
      });

      await repositori.buatPesanChat(pesanChat);

      const { id, ...rowChatTanpaId } = buatContohRowPesanChat();
      const ekspektasiParameter = rowChatTanpaId;

      expect(modelPesanChat.create).toHaveBeenCalledWith(ekspektasiParameter);
    });

    it("harus memperbarui 'id' class 'PesanChat' sesuai dengan id yang dihasilkan database", async () => {
      const pesanChat = buatContohPesanChat();

      const idPesanChatBaru = 21n;

      const mockRowPesanChatBaru = buatContohRowPesanChat();
      mockRowPesanChatBaru.id = idPesanChatBaru;
      const customInstancePesanChat = {
        toJSON: vi.fn().mockReturnValue(mockRowPesanChatBaru),
      } as unknown as Model;

      const modelPesanChat = mockModelPesanChat(customInstancePesanChat);

      const repositori = buatRepositoriChat({
        modelPesanChat,
      });

      await repositori.buatPesanChat(pesanChat);

      expect(pesanChat.id).eq(idPesanChatBaru);
    });
  });

  // describe("fungsi buatLampiranPesanChat", () => {
  //   it("harus memanggil fungsi 'lampiranPesanChatKeRow' class 'RowConverterChat'", async () => {
  //     const lampiranPesanChat = buatContohLampiranPesanChat();

  //     const rowConverterChat = mockRowConverterChat();

  //     const repositori = buatRepositoriChat({
  //       rowConverterChat,
  //     });

  //     await repositori.buatLampiranPesanChat(lampiranPesanChat);

  //     expect(rowConverterChat.lampiranPesanChatKeRow).toHaveBeenCalledOnce();
  //   });

  //   it("harus memanggil fungsi 'create' objek 'modelLampiranPesanChat'", async () => {
  //     const lampiranPesanChat = buatContohLampiranPesanChat();

  //     const modelLampiranPesanChat = mockModelLampiranPesanChat();

  //     const repositori = buatRepositoriChat({
  //       modelLampiranPesanChat,
  //     });

  //     await repositori.buatLampiranPesanChat(lampiranPesanChat);

  //     expect(modelLampiranPesanChat.create).toHaveBeenCalledOnce();
  //   });

  //   it("harus memberikan parameter valid saat memanggil fungsi 'create' objek 'modelPesanChat'", async () => {
  //     const lampiranPesanChat = buatContohLampiranPesanChat();

  //     const modelLampiranPesanChat = mockModelLampiranPesanChat();

  //     const repositori = buatRepositoriChat({
  //       modelLampiranPesanChat,
  //     });

  //     await repositori.buatLampiranPesanChat(lampiranPesanChat);

  //     const { id, ...rowTanpaId } = buatContohRowLampiranPesanChat();
  //     const ekspektasiParameter = rowTanpaId;

  //     expect(modelLampiranPesanChat.create).toHaveBeenCalledWith(ekspektasiParameter);
  //   });

  //   it("harus memperbarui 'id' class 'PesanChat' sesuai dengan id yang dihasilkan database", async () => {
  //     const lampiranPesanChat = buatContohLampiranPesanChat();

  //     const idLampiranPesanChatBaru = 8n;

  //     const mockRowLampiranPesanChatBaru = buatContohRowLampiranPesanChat();
  //     mockRowLampiranPesanChatBaru.id = idLampiranPesanChatBaru;
  //     const customInstanceLampiranPesanChat = {
  //       toJSON: vi.fn().mockReturnValue(mockRowLampiranPesanChatBaru),
  //     } as unknown as Model;

  //     const modelLampiranPesanChat = mockModelLampiranPesanChat(customInstanceLampiranPesanChat);

  //     const repositori = buatRepositoriChat({
  //       modelLampiranPesanChat,
  //     });

  //     await repositori.buatLampiranPesanChat(lampiranPesanChat);

  //     expect(lampiranPesanChat.id).eq(idLampiranPesanChatBaru);
  //   });
  // });
});
