const request = require("supertest");
const express = require("express");
const ExperienceController = require("../controllers/ExperienceController");
const { Experience, CV } = require("../models");

// ================= MOCK =================
jest.mock("../models", () => ({
  Experience: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
  CV: {
    findByPk: jest.fn(),
  },
}));

// ================= APP =================
const app = express();
app.use(express.json());

// mock auth
app.use((req, res, next) => {
  req.user = { id: 1, role: "User" };
  next();
});

// routes (FIX sesuai asli)
app.post("/experience", ExperienceController.createExperience);
app.get("/experience/cv/:cvId", ExperienceController.getExperienceByCV);
app.put("/experience/:id", ExperienceController.updateExperience);
app.delete("/experience/:id", ExperienceController.deleteExperience);
app.post("/experience/bulk", ExperienceController.bulkCreate);

// error handler (WAJIB)
app.use((err, req, res, next) => {
  if (err.name === "NotFound") {
    return res.status(404).json({ message: err.message });
  }
  if (err.name === "BadRequest") {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === "Forbidden") {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

// ================= TEST =================
describe("ExperienceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================= CREATE =================
  describe("POST /experience", () => {
    it("should create experience", async () => {
      CV.findByPk.mockResolvedValue({ id: 1 });

      Experience.create.mockResolvedValue({
        id: 1,
        company: "Tech",
      });

      const res = await request(app).post("/experience").send({
        cvId: 1,
        company: "Tech",
        position: "Dev",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
    });

    it("should fail if CV not found", async () => {
      CV.findByPk.mockResolvedValue(null);

      const res = await request(app).post("/experience").send({
        cvId: 999,
      });

      expect(res.status).toBe(404);
    });
  });

  // ================= GET =================
  describe("GET /experience/cv/:cvId", () => {
    it("should get experiences", async () => {
      Experience.findAll.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      const res = await request(app).get("/experience/cv/1");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should return empty array", async () => {
      Experience.findAll.mockResolvedValue([]);

      const res = await request(app).get("/experience/cv/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ================= UPDATE =================
  describe("PUT /experience/:id", () => {
    it("should update experience", async () => {
      const mockExp = {
        id: 1,
        update: jest.fn().mockResolvedValue(true),
      };

      Experience.findByPk.mockResolvedValue(mockExp);

      const res = await request(app)
        .put("/experience/1")
        .send({ position: "Lead" });

      expect(res.status).toBe(200);
    });

    it("should fail if not found", async () => {
      Experience.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put("/experience/999")
        .send({});

      expect(res.status).toBe(404);
    });
  });

  // ================= DELETE =================
  describe("DELETE /experience/:id", () => {
    it("should delete experience", async () => {
      const mockExp = {
        destroy: jest.fn().mockResolvedValue(true),
      };

      Experience.findByPk.mockResolvedValue(mockExp);

      const res = await request(app).delete("/experience/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Experience deleted");
    });

    it("should fail if not found", async () => {
      Experience.findByPk.mockResolvedValue(null);

      const res = await request(app).delete("/experience/999");

      expect(res.status).toBe(404);
    });
  });

  // ================= BULK =================
  describe("POST /experience/bulk", () => {
    it("should bulk create experiences", async () => {
      CV.findByPk.mockResolvedValue({
        id: 1,
        userId: 1,
      });

      Experience.destroy.mockResolvedValue(true);
      Experience.bulkCreate.mockResolvedValue(true);

      const res = await request(app)
        .post("/experience/bulk")
        .send({
          cvId: 1,
          experiences: [
            {
              company: "A",
              position: "Dev",
              description: "desc",
              startDate: "2020",
              endDate: "2021",
            },
          ],
        });

      expect(res.status).toBe(201);
    });

    it("should fail without cvId", async () => {
      const res = await request(app)
        .post("/experience/bulk")
        .send({});

      expect(res.status).toBe(400);
    });

    it("should fail if CV not found", async () => {
      CV.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post("/experience/bulk")
        .send({ cvId: 1 });

      expect(res.status).toBe(404);
    });

    it("should fail unauthorized", async () => {
      CV.findByPk.mockResolvedValue({
        id: 1,
        userId: 2,
      });

      const res = await request(app)
        .post("/experience/bulk")
        .send({ cvId: 1 });

      expect(res.status).toBe(403);
    });

    it("should return 200 if no valid data", async () => {
      CV.findByPk.mockResolvedValue({
        id: 1,
        userId: 1,
      });

      Experience.destroy.mockResolvedValue(true);

      const res = await request(app)
        .post("/experience/bulk")
        .send({
          cvId: 1,
          experiences: [],
        });

      expect(res.status).toBe(200);
    });
  });
});