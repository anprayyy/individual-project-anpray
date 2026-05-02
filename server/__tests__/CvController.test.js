const request = require("supertest");
const express = require("express");
const router = require("../routes/cvRoutes");
const { CV } = require("../models");

// ================= MOCK =================
jest.mock("../models", () => ({
  CV: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Experience: {
    bulkCreate: jest.fn(),
  },
  User: {},
}));

jest.mock("../middlewares/authentication", () =>
  jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
);

jest.mock("../middlewares/authorization", () => ({
  authorizationCV: jest.fn((req, res, next) => next()),
}));

jest.mock("puppeteer", () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn(),
      pdf: jest.fn().mockResolvedValue(Buffer.from("PDF")),
    }),
    close: jest.fn(),
  }),
}));

jest.mock("../helpers/generatePDF", () => ({
  generatePDFBuffer: jest.fn().mockResolvedValue(Buffer.from("PDF")),
}));

// ================= APP =================
const app = express();
app.use(express.json());
app.use("/cv", router);

// error handler
app.use((err, req, res, next) => {
  if (err.name === "NotFound") {
    return res.status(404).json({ message: err.message });
  }
  if (err.name === "BadRequest") {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === "TooManyRequests") {
    return res.status(429).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error" });
});

// ================= TEST =================
describe("CV Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== CREATE =====
  describe("POST /cv", () => {
    it("should create CV", async () => {
      const mock = { id: 1, fullName: "John" };

      CV.create.mockResolvedValue(mock);

      const res = await request(app).post("/cv").send({
        fullName: "John",
        title: "Engineer",
      });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(1);
    });
  });

  // ===== GET ALL =====
  describe("GET /cv", () => {
    it("should get all CV", async () => {
      CV.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const res = await request(app).get("/cv");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  // ===== GET DETAIL =====
  describe("GET /cv/:id", () => {
    it("should get detail CV", async () => {
      CV.findByPk.mockResolvedValue({ id: 1 });

      const res = await request(app).get("/cv/1");

      expect(res.status).toBe(200);
    });

    it("should return 404", async () => {
      CV.findByPk.mockResolvedValue(null);

      const res = await request(app).get("/cv/1");

      expect(res.status).toBe(404);
    });
  });

  // ===== UPDATE =====
  describe("PUT /cv/:id", () => {
    it("should update CV", async () => {
      const mock = {
        id: 1,
        update: jest.fn().mockResolvedValue(true),
      };

      CV.findByPk.mockResolvedValue(mock);

      const res = await request(app)
        .put("/cv/1")
        .send({ fullName: "Updated" });

      expect(res.status).toBe(200);
      expect(mock.update).toHaveBeenCalled();
    });
  });

  // ===== DELETE =====
  describe("DELETE /cv/:id", () => {
    it("should delete CV", async () => {
      const mock = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      CV.findByPk.mockResolvedValue(mock);

      const res = await request(app).delete("/cv/1");

      expect(res.status).toBe(200);
      expect(mock.destroy).toHaveBeenCalled();
    });
  });

  // ===== DOWNLOAD =====
  describe("GET /cv/:id/download", () => {
    it("should download PDF", async () => {
      CV.findByPk.mockResolvedValue({
        id: 1,
        updatedAt: new Date(),
        Experiences: [],
      });

      const res = await request(app).get("/cv/1/download");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("pdf");
    });
  });

  // ===== REVIEW AI =====
  describe("GET /cv/:id/review", () => {
    it("should review CV", async () => {
      CV.findByPk.mockResolvedValue({
        id: 1,
        updatedAt: new Date(),
        Experiences: [],
      });

      const res = await request(app).get("/cv/1/review");

      expect([200, 429]).toContain(res.status);
    });
  });
});