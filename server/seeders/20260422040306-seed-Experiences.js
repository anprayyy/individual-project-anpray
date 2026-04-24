'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Experiences', [
      {
        id: 1,
        cvId: 1,
        company: "Tokopedia",
        position: "Frontend Dev",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2023-01-01"),
        description: "Build UI",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Experiences', null, {});
  }
};
