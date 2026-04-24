const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");
const { signToken, verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

// Mock dependencies
jest.mock("../helpers/jwt");
jest.mock("../models", () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

describe("Authentication Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("should authenticate with valid token", async () => {
      const token = "valid_jwt_token";
      const decoded = { id: 1, email: "test@example.com" };

      req.headers.authorization = `Bearer ${token}`;
      verifyToken.mockReturnValue(decoded);
      User.findByPk.mockResolvedValue({ id: 1, email: "test@example.com" });

      await authentication(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalled();
    });

    it("should fail without authorization header", async () => {
      const error = {};

      try {
        await authentication(req, res, next);
      } catch (err) {
        Object.assign(error, err);
      }

      // Either throw or call next with error
      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should fail with invalid token format", async () => {
      req.headers.authorization = "InvalidFormat";

      const error = {};

      try {
        await authentication(req, res, next);
      } catch (err) {
        Object.assign(error, err);
      }

      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should fail with expired token", async () => {
      const token = "expired_token";
      req.headers.authorization = `Bearer ${token}`;

      verifyToken.mockImplementation(() => {
        throw new Error("Token expired");
      });

      const error = {};

      try {
        await authentication(req, res, next);
      } catch (err) {
        Object.assign(error, err);
      }

      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should handle missing user in database", async () => {
      const token = "valid_jwt_token";
      const decoded = { id: 999, email: "nonexistent@example.com" };

      req.headers.authorization = `Bearer ${token}`;
      verifyToken.mockReturnValue(decoded);
      User.findByPk.mockResolvedValue(null);

      const error = {};

      try {
        await authentication(req, res, next);
      } catch (err) {
        Object.assign(error, err);
      }

      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe("authorization", () => {
    it("should authorize user with correct role", (done) => {
      req.user = { id: 1, role: "admin" };

      const authorizeAdmin = authorization("admin");
      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      done();
    });

    it("should deny user with wrong role", (done) => {
      req.user = { id: 1, role: "user" };

      const authorizeAdmin = authorization("admin");
      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Object));
      done();
    });

    it("should deny request without user", (done) => {
      req.user = null;

      const authorizeAdmin = authorization("admin");
      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Object));
      done();
    });

    it("should support multiple roles", (done) => {
      req.user = { id: 1, role: "moderator" };

      const authorizeMultiple = authorization(["admin", "moderator"]);
      authorizeMultiple(req, res, next);

      expect(next).toHaveBeenCalled();
      done();
    });
  });
});
