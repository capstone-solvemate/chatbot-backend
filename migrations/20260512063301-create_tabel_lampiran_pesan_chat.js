"use strict";

const { NAMA_TABEL_PESAN_CHAT } = require("./20260503180919-create_tabel_pesan_chat");

const NAMA_TABEL = "lampiran_pesan_chat";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  NAMA_TABEL_LAMPIRAN: NAMA_TABEL,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_pesan_chat: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: NAMA_TABEL_PESAN_CHAT,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nama_berkas: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      ukuran: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(NAMA_TABEL, ["id_pesan_chat"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
