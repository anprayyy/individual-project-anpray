const request = require("supertest");
const express = require("express");
const AuthController = require("../controllers/AuthController");
const { User } = require("../models");
const { signToken } = require("../helpers/jwt");
const axios = require("axios");

// Mock dependencies
jest.mock("../models", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
  },
}));

jest.mock("../helpers/jwt", () => ({
  signToken: jest.fn(),
}));

jest.mock("../helpers/bcrypt", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

jest.mock("axios");

// Create test app
const app = express();
app.use(express.json());

app.post("/register", AuthController.register);
app.post("/login", AuthController.login);
app.post("/auth/google-verify", AuthController.googleVerify);

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= REGISTER TESTS =============
  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const mockUser = {
        id: 1,
        email: userData.email,
        name: userData.name,
        password: "hashed_password",
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: userData.email,
          name: userData.name,
        }),
      };

      User.create.mockResolvedValue(mockUser);

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should fail to register without email", async () => {
      const userData = {
        password: "password123",
        name: "Test User",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(400);
    });

    it("should handle database error on register", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      User.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(500);
    });
  });

  // ============= LOGIN TESTS =============
  describe("POST /login", () => {
    it("should login user with correct credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: "hashed_password",
        role: "user",
      };

      User.findOne.mockResolvedValue(mockUser);
      const { comparePassword } = require("../helpers/bcrypt");
      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue("jwt_token_123");

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token", "jwt_token_123");
    });

    it("should fail without email", async () => {
      const loginData = {
        password: "password123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should fail without password", async () => {
      const loginData = {
        email: "test@example.com",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(400);
    });

    it("should fail with non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Invalid Email/password");
    });

    it("should fail with wrong password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        id: 1,
        email: loginData.email,
        password: "hashed_password",
      };

      User.findOne.mockResolvedValue(mockUser);
      const { comparePassword } = require("../helpers/bcrypt");
      comparePassword.mockReturnValue(false);

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(401);
    });
  });

  // ============= GOOGLE VERIFY TESTS =============
  describe("POST /auth/google-verify", () => {
    beforeEach(() => {
      process.env.GOOGLE_CLIENT_ID =
        "713734657205-0rnohinjaooijhlvbf59lik3g6v962j6.apps.googleusercontent.com";
    });

    it("should verify valid Google ID token", async () => {
      const token = "valid_google_id_token";

      const mockTokenInfo = {
        issued_to:
          "713734657205-0rnohinjaooijhlvbf59lik3g6v962j6.apps.googleusercontent.com",
        audience:
          "713734657205-0rnohinjaooijhlvbf59lik3g6v962j6.apps.googleusercontent.com",
        user_id: "117358786459399215834",
        expires_in: 3597,
        email: "test@gmail.com",
        email_verified: true,
        issuer: "https://accounts.google.com",
        issued_at: 1776968284,
      };

      const mockUser = {
        id: 1,
        email: "test@gmail.com",
        password: "random",
        role: "user",
      };

      axios.get.mockResolvedValue({ data: mockTokenInfo });
      User.findOrCreate.mockResolvedValue([mockUser]);
      signToken.mockReturnValue("jwt_token_123");

      const response = await request(app)
        .post("/auth/google-verify")
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
      expect(signToken).toHaveBeenCalled();
    });

    it("should fail without token", async () => {
      const response = await request(app).post("/auth/google-verify").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("token missing");
    });

    it("should fail with invalid Google token", async () => {
      const token = "invalid_token";

      axios.get.mockRejectedValue(new Error("Invalid token"));

      const response = await request(app)
        .post("/auth/google-verify")
        .send({ token });

      expect(response.status).toBe(401);
    });

    it("should create new user if not exists", async () => {
      const token = "valid_google_id_token";

      const mockTokenInfo = {
        audience:
          "713734657205-0rnohinjaooijhlvbf59lik3g6v962j6.apps.googleusercontent.com",
        email: "newuser@gmail.com",
        name: "New User",
      };

      const newMockUser = {
        id: 2,
        email: "newuser@gmail.com",
        password: "random",
        role: "user",
      };

      axios.get.mockResolvedValue({ data: mockTokenInfo });
      User.findOrCreate.mockResolvedValue([newMockUser]);
      signToken.mockReturnValue("jwt_token_456");

      const response = await request(app)
        .post("/auth/google-verify")
        .send({ token });

      expect(response.status).toBe(200);
      expect(User.findOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: "newuser@gmail.com" },
        }),
      );
    });

    it("should fail if no email in token", async () => {
      const token = "invalid_google_id_token";

      const mockTokenInfo = {
        audience:
          "713734657205-0rnohinjaooijhlvbf59lik3g6v962j6.apps.googleusercontent.com",
        email_verified: true,
      };

      axios.get.mockResolvedValue({ data: mockTokenInfo });

      const response = await request(app)
        .post("/auth/google-verify")
        .send({ token });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("email");
    });

    it("should fail if audience doesn't match", async () => {
      const token = "invalid_audience_token";

      const mockTokenInfo = {
        audience: "wrong-client-id.apps.googleusercontent.com",
        email: "test@gmail.com",
        email_verified: true,
      };

      axios.get.mockResolvedValue({ data: mockTokenInfo });

      const response = await request(app)
        .post("/auth/google-verify")
        .send({ token });

      expect(response.status).toBe(401);
    });
  });
});
