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

describe("CV Routes", () => {
  let testUser;
  let authToken;
  let testCV;

  beforeEach(async () => {
    // Clear database - delete in correct order to avoid foreign key violations
    await Experience.destroy({ where: {} });
    await CV.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test user
    const userData = generateMockUser();
    testUser = userData;

    const registerRes = await request(app)
      .post("/auth/register")
      .send(userData);

    if (!registerRes.body.id) {
      throw new Error("Register failed: " + JSON.stringify(registerRes.body));
    }

    testUser.id = registerRes.body.id;

    // Login to get token
    const loginRes = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    if (!loginRes.body.access_token) {
      throw new Error("Login failed: " + JSON.stringify(loginRes.body));
    }

    authToken = loginRes.body.access_token;
  });

  describe("POST /cvs", () => {
    it("should create a new CV with valid data", async () => {
      const cvData = {
        title: "Senior Developer CV",
        summary: "Experienced fullstack developer",
        fullName: "John Doe",
        education: "Bachelor of Computer Science",
        skills: "JavaScript, React, Node.js",
      };

      const response = await request(app)
        .post("/cvs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(cvData);

      if (response.status !== 201) {
        console.log("POST /cvs error:", {
          status: response.status,
          body: response.body,
        });
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(cvData.title);
    });

    it("should fail without authentication", async () => {
      const cvData = {
        title: "CV Title",
        summary: "Summary",
        fullName: "Name",
        education: "Education",
        skills: "Skills",
      };

      const response = await request(app).post("/cvs").send(cvData);

      expect(response.status).toBe(401);
    });

    it("should fail with missing title", async () => {
      const cvData = {
        summary: "Summary",
        fullName: "Name",
      };

      const response = await request(app)
        .post("/cvs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(cvData);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /cvs", () => {
    beforeEach(async () => {
      // Create test CV
      const cvData = {
        title: "Test CV",
        summary: "Test Summary",
        fullName: "Test User",
        education: "Test Education",
        skills: "Test Skills",
      };

      const res = await request(app)
        .post("/cvs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(cvData);

      testCV = res.body;
    });

    it("should get all CVs for authenticated user", async () => {
      const response = await request(app)
        .get("/cvs")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/cvs");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /cvs/:id", () => {
    beforeEach(async () => {
      const cvData = {
        title: "Test CV",
        summary: "Test Summary",
        fullName: "Test User",
        education: "Test Education",
        skills: "Test Skills",
      };

      const res = await request(app)
        .post("/cvs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(cvData);

      testCV = res.body;
    });

    it("should get specific CV by ID", async () => {
      const response = await request(app)
        .get(`/cvs/${testCV.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testCV.id);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get(`/cvs/${testCV.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /cvs/:id", () => {
    beforeEach(async () => {
      const cvData = {
        title: "Test CV",
        summary: "Test Summary",
        fullName: "Test User",
        education: "Test Education",
        skills: "Test Skills",
      };

      const res = await request(app)
        .post("/cvs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(cvData);

      testCV = res.body;
    });

    it("should update CV with valid data", async () => {
      const updateData = {
        title: "Updated CV Title",
        summary: "Updated summary",
      };

      const response = await request(app)
        .put(`/cvs/${testCV.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
    });

    it("should fail without authentication", async () => {
      const updateData = { title: "New Title" };

      const response = await request(app)
        .put(`/cvs/${testCV.id}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /cvs/:id", () => {
    beforeEach(async () => {
      const cvData = {
        title: "Test CV",
        summary: "Test Summary",
        fullName: "Test User",
        education: "Test Education",
        skills: "Test Skills",
      };

      const res = await request(app)
        .post("/cvs")
        .set("Authorization", `Bearer ${authToken}`)
        .send(cvData);

      testCV = res.body;
    });

    it("should delete CV successfully", async () => {
      const response = await request(app)
        .delete(`/cvs/${testCV.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).delete(`/cvs/${testCV.id}`);

      expect(response.status).toBe(401);
    });
  });
});
