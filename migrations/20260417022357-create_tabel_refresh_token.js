"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("refresh_token", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      peran: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      terakhir_dipakai: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      kadaluarsa_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dibuat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("refresh_token");
  },
};
