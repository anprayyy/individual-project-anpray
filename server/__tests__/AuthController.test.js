const request = require("supertest");
const express = require("express");
const AuthController = require("../controllers/AuthController");
const { User } = require("../models");
const { signToken } = require("../helpers/jwt");
const axios = require("axios");

// ================= MOCK =================
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
}));

jest.mock("axios");

// ================= APP =================
const app = express();
app.use(express.json());

app.post("/register", AuthController.register);
app.post("/login", AuthController.login);
app.post("/auth/google-verify", AuthController.googleVerify);

// ✅ WAJIB ADA
app.use((err, req, res, next) => {
  if (err.name === "BadRequest") {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === "Unauthorized") {
    return res.status(401).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error" });
});

// ================= TEST =================
describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
  });

  // ================= REGISTER =================
  describe("POST /register", () => {
    it("should register successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: "test@example.com",
          name: "Test User",
        }),
      };

      User.create.mockResolvedValue(mockUser);

      const res = await request(app).post("/register").send({
        email: "test@example.com",
        password: "123",
        name: "Test User",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("email");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should fail register (sequelize error)", async () => {
      User.create.mockRejectedValue(new Error("DB error"));

      const res = await request(app).post("/register").send({
        email: "test@example.com",
      });

      expect(res.status).toBe(500);
    });
  });

  // ================= LOGIN =================
  describe("POST /login", () => {
    const { comparePassword } = require("../helpers/bcrypt");

    it("should login success", async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@mail.com",
        password: "hashed",
        role: "user",
      });

      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue("token123");

      const res = await request(app).post("/login").send({
        email: "test@mail.com",
        password: "123",
      });

      expect(res.status).toBe(200);
      expect(res.body.access_token).toBe("token123");
    });

    it("should fail without email", async () => {
      const res = await request(app).post("/login").send({
        password: "123",
      });

      expect(res.status).toBe(400);
    });

    it("should fail without password", async () => {
      const res = await request(app).post("/login").send({
        email: "test@mail.com",
      });

      expect(res.status).toBe(400);
    });

    it("should fail user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post("/login").send({
        email: "x@mail.com",
        password: "123",
      });

      expect(res.status).toBe(401);
    });

    it("should fail wrong password", async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@mail.com",
        password: "hashed",
      });

      comparePassword.mockReturnValue(false);

      const res = await request(app).post("/login").send({
        email: "test@mail.com",
        password: "wrong",
      });

      expect(res.status).toBe(401);
    });
  });

  // ================= GOOGLE VERIFY =================
  describe("POST /auth/google-verify", () => {
    it("should verify valid token", async () => {
      axios.get.mockResolvedValue({
        data: {
          audience: "test-client-id",
          email: "google@mail.com",
          name: "Google User",
        },
      });

      User.findOrCreate.mockResolvedValue([
        { id: 1, email: "google@mail.com", role: "user" },
      ]);

      signToken.mockReturnValue("google_token");

      const res = await request(app)
        .post("/auth/google-verify")
        .send({ token: "valid" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
    });

    it("should fail without token", async () => {
      const res = await request(app)
        .post("/auth/google-verify")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Google token missing");
    });

    it("should fail invalid token", async () => {
      axios.get.mockRejectedValue(new Error("Invalid"));

      const res = await request(app)
        .post("/auth/google-verify")
        .send({ token: "invalid" });

      expect(res.status).toBe(401);
    });

    it("should create new user", async () => {
      axios.get.mockResolvedValue({
        data: {
          audience: "test-client-id",
          email: "new@mail.com",
          name: "New User",
        },
      });

      User.findOrCreate.mockResolvedValue([
        { id: 2, email: "new@mail.com", role: "user" },
      ]);

      signToken.mockReturnValue("new_token");

      const res = await request(app)
        .post("/auth/google-verify")
        .send({ token: "valid" });

      expect(res.status).toBe(200);
      expect(User.findOrCreate).toHaveBeenCalled();
    });

    it("should fail no email", async () => {
      axios.get.mockResolvedValue({
        data: {
          audience: "test-client-id",
        },
      });

      const res = await request(app)
        .post("/auth/google-verify")
        .send({ token: "valid" });

      expect(res.status).toBe(400);
    });

    it("should fail audience mismatch", async () => {
      axios.get.mockResolvedValue({
        data: {
          audience: "wrong-client",
          email: "test@mail.com",
        },
      });

      const res = await request(app)
        .post("/auth/google-verify")
        .send({ token: "valid" });

      expect(res.status).toBe(401);
    });
  });
});