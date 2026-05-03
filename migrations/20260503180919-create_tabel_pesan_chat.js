"use strict";

const { NAMA_TABEL_CHAT } = require("./20260503180915-create_tabel_chat");

const NAMA_TABEL = "pesan_chat";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      id_chat: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: NAMA_TABEL_CHAT,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      pesan: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      chat_asisten: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },

      tanggal_dibuat: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // index tambahan
    await queryInterface.addIndex(NAMA_TABEL, ["id_chat"]);
    await queryInterface.addIndex(NAMA_TABEL, ["tanggal_dibuat"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
