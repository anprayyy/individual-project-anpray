const request = require("supertest");
const express = require("express");
const ExperienceController = require("../controllers/ExperienceController");
const { Experience, Cv } = require("../models");

// Mock dependencies
jest.mock("../models", () => ({
  Experience: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Cv: {
    findByPk: jest.fn(),
  },
}));

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, email: "test@example.com" };
  next();
};

// Create test app
const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);

app.post("/experience", ExperienceController.create);
app.get("/experience/:cvId", ExperienceController.getAll);
app.put("/experience/:id", ExperienceController.update);
app.delete("/experience/:id", ExperienceController.destroy);

describe("ExperienceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= CREATE EXPERIENCE =============
  describe("POST /experience", () => {
    it("should create experience successfully", async () => {
      const expData = {
        cvId: 1,
        company: "Tech Corp",
        position: "Senior Developer",
        startDate: "2020-01-15",
        endDate: "2023-12-31",
        description: "Led development team",
      };

      const mockCv = {
        id: 1,
        userId: 1,
      };

      const mockExperience = {
        id: 1,
        ...expData,
      };

      Cv.findByPk.mockResolvedValue(mockCv);
      Experience.create.mockResolvedValue(mockExperience);

      const response = await request(app).post("/experience").send(expData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("company", "Tech Corp");
    });

    it("should fail without required fields", async () => {
      const expData = {
        cvId: 1,
        company: "Tech Corp",
        // Missing position
      };

      const response = await request(app).post("/experience").send(expData);

      expect(response.status).toBe(400);
    });

    it("should fail if CV not found", async () => {
      const expData = {
        cvId: 999,
        company: "Tech Corp",
        position: "Developer",
      };

      Cv.findByPk.mockResolvedValue(null);

      const response = await request(app).post("/experience").send(expData);

      expect(response.status).toBe(404);
    });

    it("should fail if CV doesn't belong to user", async () => {
      const expData = {
        cvId: 1,
        company: "Tech Corp",
        position: "Developer",
      };

      const mockCv = {
        id: 1,
        userId: 2, // Different user
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).post("/experience").send(expData);

      expect(response.status).toBe(403);
    });
  });

  // ============= GET ALL EXPERIENCES =============
  describe("GET /experience/:cvId", () => {
    it("should get all experiences for a CV", async () => {
      const mockCv = {
        id: 1,
        userId: 1,
      };

      const mockExperiences = [
        {
          id: 1,
          cvId: 1,
          company: "Tech Corp",
          position: "Developer",
        },
        {
          id: 2,
          cvId: 1,
          company: "Startup Inc",
          position: "Junior Developer",
        },
      ];

      Cv.findByPk.mockResolvedValue(mockCv);
      Experience.findAll.mockResolvedValue(mockExperiences);

      const response = await request(app).get("/experience/1");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });

    it("should return 404 if CV not found", async () => {
      Cv.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/experience/999");

      expect(response.status).toBe(404);
    });

    it("should check authorization", async () => {
      const mockCv = {
        id: 1,
        userId: 2, // Different user
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).get("/experience/1");

      expect(response.status).toBe(403);
    });

    it("should return empty array if no experiences", async () => {
      const mockCv = {
        id: 1,
        userId: 1,
      };

      Cv.findByPk.mockResolvedValue(mockCv);
      Experience.findAll.mockResolvedValue([]);

      const response = await request(app).get("/experience/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  // ============= UPDATE EXPERIENCE =============
  describe("PUT /experience/:id", () => {
    it("should update experience successfully", async () => {
      const updateData = {
        position: "Lead Developer",
        description: "Leading the team",
      };

      const mockExperience = {
        id: 1,
        cvId: 1,
        company: "Tech Corp",
        position: "Developer",
        update: jest.fn().mockResolvedValue(true),
      };

      const mockCv = {
        id: 1,
        userId: 1,
      };

      Experience.findByPk.mockResolvedValue(mockExperience);
      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).put("/experience/1").send(updateData);

      expect(response.status).toBe(200);
    });

    it("should return 404 if experience not found", async () => {
      Experience.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put("/experience/999")
        .send({ position: "Updated" });

      expect(response.status).toBe(404);
    });

    it("should check authorization on update", async () => {
      const mockExperience = {
        id: 1,
        cvId: 1,
      };

      const mockCv = {
        id: 1,
        userId: 2, // Different user
      };

      Experience.findByPk.mockResolvedValue(mockExperience);
      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app)
        .put("/experience/1")
        .send({ position: "Updated" });

      expect(response.status).toBe(403);
    });
  });

  // ============= DELETE EXPERIENCE =============
  describe("DELETE /experience/:id", () => {
    it("should delete experience successfully", async () => {
      const mockExperience = {
        id: 1,
        cvId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      const mockCv = {
        id: 1,
        userId: 1,
      };

      Experience.findByPk.mockResolvedValue(mockExperience);
      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).delete("/experience/1");

      expect(response.status).toBe(200);
    });

    it("should return 404 if experience not found", async () => {
      Experience.findByPk.mockResolvedValue(null);

      const response = await request(app).delete("/experience/999");

      expect(response.status).toBe(404);
    });

    it("should check authorization on delete", async () => {
      const mockExperience = {
        id: 1,
        cvId: 1,
      };

      const mockCv = {
        id: 1,
        userId: 2, // Different user
      };

      Experience.findByPk.mockResolvedValue(mockExperience);
      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).delete("/experience/1");

      expect(response.status).toBe(403);
    });
  });
});
