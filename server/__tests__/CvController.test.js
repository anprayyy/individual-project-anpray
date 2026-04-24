const request = require("supertest");
const express = require("express");
const CvController = require("../controllers/CvController");
const { Cv, Experience, User } = require("../models");

// Mock dependencies
jest.mock("../models", () => ({
  Cv: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Experience: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock("../helpers/generatePDF", () => jest.fn());

// Mock middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, email: "test@example.com" };
  next();
};

// Create test app
const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);

app.get("/cv", CvController.getAll);
app.get("/cv/:id", CvController.getById);
app.post("/cv", CvController.create);
app.put("/cv/:id", CvController.update);
app.delete("/cv/:id", CvController.destroy);
app.get("/cv/:id/download", CvController.downloadCV);

describe("CvController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= GET ALL CVs =============
  describe("GET /cv", () => {
    it("should get all CVs for authenticated user", async () => {
      const mockCvs = [
        {
          id: 1,
          userId: 1,
          fullName: "John Doe",
          title: "Software Engineer",
          summary: "Experienced developer",
          get: jest.fn().mockReturnValue(undefined),
        },
        {
          id: 2,
          userId: 1,
          fullName: "Jane Smith",
          title: "Product Manager",
          summary: "Product specialist",
          get: jest.fn().mockReturnValue(undefined),
        },
      ];

      Cv.findAll.mockResolvedValue(mockCvs);

      const response = await request(app).get("/cv");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(Cv.findAll).toHaveBeenCalled();
    });

    it("should return empty array if no CVs exist", async () => {
      Cv.findAll.mockResolvedValue([]);

      const response = await request(app).get("/cv");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should handle database errors", async () => {
      Cv.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/cv");

      expect(response.status).toBe(500);
    });
  });

  // ============= GET CV BY ID =============
  describe("GET /cv/:id", () => {
    it("should get CV by ID successfully", async () => {
      const mockCv = {
        id: 1,
        userId: 1,
        fullName: "John Doe",
        title: "Software Engineer",
        summary: "Experienced developer",
        file: "cv-1.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).get("/cv/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("fullName", "John Doe");
    });

    it("should return 404 if CV not found", async () => {
      Cv.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/cv/999");

      expect(response.status).toBe(404);
    });

    it("should validate CV belongs to user", async () => {
      const mockCv = {
        id: 1,
        userId: 2, // Different user
        fullName: "John Doe",
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).get("/cv/1");

      expect(response.status).toBe(403);
    });
  });

  // ============= CREATE CV =============
  describe("POST /cv", () => {
    it("should create new CV successfully", async () => {
      const cvData = {
        fullName: "John Doe",
        title: "Software Engineer",
        summary: "Experienced developer with 5 years experience",
      };

      const mockNewCv = {
        id: 1,
        userId: 1,
        ...cvData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Cv.create.mockResolvedValue(mockNewCv);

      const response = await request(app).post("/cv").send(cvData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("fullName", cvData.fullName);
      expect(Cv.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: cvData.fullName,
          userId: 1,
        }),
      );
    });

    it("should fail without required fields", async () => {
      const cvData = {
        title: "Software Engineer",
        // Missing fullName
      };

      const response = await request(app).post("/cv").send(cvData);

      expect(response.status).toBe(400);
    });

    it("should handle database errors on create", async () => {
      const cvData = {
        fullName: "John Doe",
        title: "Software Engineer",
        summary: "Test",
      };

      Cv.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/cv").send(cvData);

      expect(response.status).toBe(500);
    });
  });

  // ============= UPDATE CV =============
  describe("PUT /cv/:id", () => {
    it("should update CV successfully", async () => {
      const updateData = {
        fullName: "John Updated",
        title: "Senior Engineer",
      };

      const mockExistingCv = {
        id: 1,
        userId: 1,
        fullName: "John Doe",
        title: "Software Engineer",
        update: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockExistingCv);

      const response = await request(app).put("/cv/1").send(updateData);

      expect(response.status).toBe(200);
      expect(mockExistingCv.update).toHaveBeenCalledWith(updateData);
    });

    it("should return 404 if CV not found for update", async () => {
      Cv.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put("/cv/999")
        .send({ fullName: "Updated" });

      expect(response.status).toBe(404);
    });

    it("should check authorization before update", async () => {
      const mockCv = {
        id: 1,
        userId: 2, // Different user
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app)
        .put("/cv/1")
        .send({ fullName: "Updated" });

      expect(response.status).toBe(403);
    });
  });

  // ============= DELETE CV =============
  describe("DELETE /cv/:id", () => {
    it("should delete CV successfully", async () => {
      const mockCv = {
        id: 1,
        userId: 1,
        file: "cv-1.pdf",
        destroy: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).delete("/cv/1");

      expect(response.status).toBe(200);
      expect(mockCv.destroy).toHaveBeenCalled();
    });

    it("should return 404 if CV not found for delete", async () => {
      Cv.findByPk.mockResolvedValue(null);

      const response = await request(app).delete("/cv/999");

      expect(response.status).toBe(404);
    });

    it("should check authorization before delete", async () => {
      const mockCv = {
        id: 1,
        userId: 2, // Different user
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).delete("/cv/1");

      expect(response.status).toBe(403);
    });
  });

  // ============= DOWNLOAD CV =============
  describe("GET /cv/:id/download", () => {
    it("should download CV as PDF", async () => {
      const mockCv = {
        id: 1,
        userId: 1,
        fullName: "John Doe",
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).get("/cv/1/download");

      // Response should have PDF content type or redirect
      expect([200, 302]).toContain(response.status);
    });

    it("should return 404 if CV not found for download", async () => {
      Cv.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/cv/999/download");

      expect(response.status).toBe(404);
    });

    it("should check authorization for download", async () => {
      const mockCv = {
        id: 1,
        userId: 2, // Different user
        get: jest.fn().mockReturnValue(undefined),
      };

      Cv.findByPk.mockResolvedValue(mockCv);

      const response = await request(app).get("/cv/1/download");

      expect(response.status).toBe(403);
    });
  });
});
