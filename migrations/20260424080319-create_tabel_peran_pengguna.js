"use strict";

const NAMA_TABEL = "peran_pengguna";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pengguna",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      peran: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint(NAMA_TABEL, {
      fields: ["id_pengguna", "peran"],
      type: "primary key",
      name: "pk_peran_pengguna",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
