const request = require("supertest");
const express = require("express");
const cors = require("cors");
const router = require("../routers");
const errorHandler = require("../middlewares/errorHandler");
const { User } = require("../models");
const { generateMockUser } = require("./setup");

// Setup test app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(errorHandler);

describe("Authentication Routes", () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {} });
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = generateMockUser();

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe(userData.email);
      expect(response.body.name).toBe(userData.name);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should fail with missing email", async () => {
      const userData = {
        password: "TestPassword123!",
        name: "Test User",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should fail with missing password", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should fail with duplicate email", async () => {
      const userData = generateMockUser();

      // Register first user
      await request(app).post("/auth/register").send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      const userData = generateMockUser();
      testUser = userData;

      await request(app).post("/auth/register").send(userData);
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      authToken = response.body.access_token;
    });

    it("should fail with invalid email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.message).toContain("Invalid");
    });

    it("should fail with invalid password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        })
        .expect(401);

      expect(response.body.message).toContain("Invalid");
    });

    it("should fail with missing email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          password: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should fail with missing password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /auth/github", () => {
    it("should redirect to GitHub OAuth authorization", async () => {
      const response = await request(app).get("/auth/github").expect(302);

      expect(response.headers.location).toContain("github.com/login/oauth");
      expect(response.headers.location).toContain("client_id");
    });
  });

  describe("POST /auth/google-verify", () => {
    it("should fail with missing token", async () => {
      const response = await request(app)
        .post("/auth/google-verify")
        .send({})
        .expect(400);

      expect(response.body.message).toContain("token");
    });

    it("should fail with invalid Google token", async () => {
      const response = await request(app)
        .post("/auth/google-verify")
        .send({
          token: "invalid.jwt.token",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message");
    });
  });
});
