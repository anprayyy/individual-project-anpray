const request = require("supertest");
const express = require("express");
const cors = require("cors");
const router = require("../routers");
const errorHandler = require("../middlewares/errorHandler");
const { User, CV, Experience } = require("../models");
const { generateMockUser } = require("./setup");

// Setup test app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(errorHandler);

describe("Experience Routes", () => {
  let testUser;
  let authToken;
  let testCV;
  let testExperience;

  beforeEach(async () => {
    // Clear database - delete in correct order to avoid foreign key violations
    await Experience.destroy({ where: {} });
    await CV.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test user
    const userData = generateMockUser();
    const registerRes = await request(app)
      .post("/auth/register")
      .send(userData);

    if (!registerRes.body.id) {
      throw new Error("Register failed");
    }

    testUser = registerRes.body;

    // Login to get token
    const loginRes = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    if (!loginRes.body.access_token) {
      throw new Error("Login failed");
    }

    authToken = loginRes.body.access_token;

    // Create test CV
    const cvData = {
      title: "Test CV",
      summary: "Test Summary",
      fullName: "Test User",
      education: "Test Education",
      skills: "Test Skills",
    };

    const cvRes = await request(app)
      .post("/cvs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(cvData);

    if (!cvRes.body.id) {
      console.log("CV creation response:", {
        status: cvRes.status,
        body: cvRes.body,
        text: cvRes.text,
      });
      throw new Error(`CV creation failed: status=${cvRes.status}`);
    }

    testCV = cvRes.body;
  });

  describe("POST /experiences", () => {
    it("should create new experience successfully", async () => {
      const expData = {
        company: "Tech Company",
        position: "Developer",
        description: "Worked on backend systems",
        startDate: "2022-01-01",
        endDate: "2023-01-01",
        cvId: testCV.id,
      };

      const response = await request(app)
        .post("/experiences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.company).toBe(expData.company);
    });

    it("should fail without authentication", async () => {
      const expData = {
        company: "Tech Company",
        position: "Developer",
        cvId: testCV.id,
      };

      const response = await request(app).post("/experiences").send(expData);

      expect(response.status).toBe(401);
    });

    it("should fail with missing required fields", async () => {
      const expData = {
        position: "Developer",
        cvId: testCV.id,
      };

      const response = await request(app)
        .post("/experiences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expData);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /experiences/cv/:cvId", () => {
    beforeEach(async () => {
      const expData1 = {
        company: "Company 1",
        position: "Developer",
        description: "First experience",
        cvId: testCV.id,
      };

      const expData2 = {
        company: "Company 2",
        position: "Senior Dev",
        description: "Second experience",
        cvId: testCV.id,
      };

      await request(app)
        .post("/experiences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expData1);

      await request(app)
        .post("/experiences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expData2);
    });

    it("should get all experiences for a CV", async () => {
      const response = await request(app)
        .get(`/experiences/cv/${testCV.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      if (response.status !== 200) {
        console.log("GET /experiences/cv error:", {
          status: response.status,
          body: response.body,
        });
      }

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get(`/experiences/cv/${testCV.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /experiences/:id", () => {
    beforeEach(async () => {
      const expData = {
        company: "Original Company",
        position: "Developer",
        description: "Original description",
        startDate: "2022-01-01",
        endDate: "2023-01-01",
        cvId: testCV.id,
      };

      const res = await request(app)
        .post("/experiences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expData);

      testExperience = res.body;
    });

    it("should update experience successfully", async () => {
      const updateData = {
        position: "Senior Developer",
        description: "Updated description",
      };

      const response = await request(app)
        .put(`/experiences/${testExperience.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      if (response.status !== 200) {
        console.log("PUT /experiences error:", {
          status: response.status,
          body: response.body,
        });
      }

      expect(response.status).toBe(200);
      expect(response.body.position).toBe(updateData.position);
    });

    it("should fail without authentication", async () => {
      const updateData = { position: "New Position" };

      const response = await request(app)
        .put(`/experiences/${testExperience.id}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /experiences/:id", () => {
    beforeEach(async () => {
      const expData = {
        company: "Test Company",
        position: "Developer",
        description: "Test experience",
        startDate: "2022-01-01",
        endDate: "2023-01-01",
        cvId: testCV.id,
      };

      const res = await request(app)
        .post("/experiences")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expData);

      testExperience = res.body;
    });

    it("should delete experience successfully", async () => {
      const response = await request(app)
        .delete(`/experiences/${testExperience.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      if (response.status !== 200) {
        console.log("DELETE /experiences error:", {
          status: response.status,
          body: response.body,
        });
      }

      expect(response.status).toBe(200);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).delete(
        `/experiences/${testExperience.id}`,
      );

      expect(response.status).toBe(401);
    });
  });
});
