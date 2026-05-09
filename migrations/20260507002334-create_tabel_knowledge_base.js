"use strict";

const NAMA_TABEL = "knowledge_base";
const { NAMA_TABEL_KATEGORI } = require("./20260424192059-create_tabel_kategori");

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
      doc_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true,
      },
      judul: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_kategori: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_KATEGORI,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nama_berkas: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(NAMA_TABEL, ["doc_id"], { unique: true });
    await queryInterface.addIndex(NAMA_TABEL, ["status"]);
    await queryInterface.addIndex(NAMA_TABEL, ["id_kategori"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
