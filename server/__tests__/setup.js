// Test setup and utilities
require("dotenv").config({ path: ".env" });

const { sequelize } = require("../models");

// Sync database before tests
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Cleanup after tests
afterAll(async () => {
  await sequelize.close();
});

// Reset database between tests if needed
beforeEach(async () => {
  // Optional: Clear all tables before each test
  // This ensures test isolation
});

// Mock data generators
const generateMockUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: "TestPassword123!",
  name: "Test User",
});

const generateMockCV = (userId) => ({
  title: "Software Engineer",
  summary: "Experienced developer",
  fullName: "Test Person",
  userId,
});

const generateMockExperience = (cvId) => ({
  company: "Tech Company",
  position: "Developer",
  description: "Worked on backend systems",
  startDate: new Date("2022-01-01"),
  endDate: new Date("2023-01-01"),
  cvId,
});

module.exports = {
  generateMockUser,
  generateMockCV,
  generateMockExperience,
};
