"use strict";

const { NAMA_TABEL_KATEGORI } = require("./20260424192059-create_tabel_kategori");

const NAMA_TABEL = "faq";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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

      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });

    // index tambahan
    await queryInterface.addIndex(NAMA_TABEL, ["id_kategori"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
