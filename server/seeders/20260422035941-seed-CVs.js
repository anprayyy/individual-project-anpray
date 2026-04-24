'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CVs', [
      {
        id: 1,
        userId: 2,
        title: "Frontend Developer",
        summary: "Passionate frontend dev",
        education: "S1 Informatika",
        skills: "React, Tailwind, JS",
        photoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CVs', null, {});
  }
};
