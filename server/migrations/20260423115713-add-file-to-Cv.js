"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("CVs", "file", Sequelize.STRING);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("CVs", "file");
  },
};
