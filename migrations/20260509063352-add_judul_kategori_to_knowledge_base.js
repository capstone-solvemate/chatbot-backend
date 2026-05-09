"use strict";

const { NAMA_TABEL_KATEGORI } = require("./20260424192059-create_tabel_kategori");
const { NAMA_TABEL_KNOWLEDGE_BASE: NAMA_TABEL } = require("./20260507002334-create_tabel_knowledge_base");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(NAMA_TABEL, "judul", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "",
      after: "doc_id",
    });

    await queryInterface.addColumn(NAMA_TABEL, "id_kategori", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: NAMA_TABEL_KATEGORI,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      after: "judul",
    });

    await queryInterface.addIndex(NAMA_TABEL, ["id_kategori"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(NAMA_TABEL, ["id_kategori"]);
    await queryInterface.removeColumn(NAMA_TABEL, "id_kategori");
    await queryInterface.removeColumn(NAMA_TABEL, "judul");
  },
};
