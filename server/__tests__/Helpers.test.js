const { signToken, verifyToken } = require("../helpers/jwt");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");

describe("JWT Helper", () => {
  describe("signToken", () => {
    it("should generate a valid JWT token", () => {
      const payload = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };

      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should generate different tokens for different payloads", () => {
      const payload1 = { id: 1, email: "test1@example.com" };
      const payload2 = { id: 2, email: "test2@example.com" };

      const token1 = signToken(payload1);
      const token2 = signToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it("should handle empty payload", () => {
      const token = signToken({});

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const payload = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it("should throw error for tampered token", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = signToken(payload);
      const tamperedToken = token.slice(0, -5) + "xxxxx";

      expect(() => {
        verifyToken(tamperedToken);
      }).toThrow();
    });

    it("should throw error for empty string token", () => {
      expect(() => {
        verifyToken("");
      }).toThrow();
    });
  });
});

describe("Bcrypt Helper", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "mysecurepassword";

      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it("should hash the same password to different results", async () => {
      const password = "mysecurepassword";

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle long passwords", async () => {
      const longPassword = "a".repeat(100);

      const hashedPassword = await hashPassword(longPassword);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe("string");
    });

    it("should handle special characters", async () => {
      const passwordWithSpecialChars = "P@ss!w0rd#$%^&*";

      const hashedPassword = await hashPassword(passwordWithSpecialChars);

      expect(hashedPassword).toBeDefined();
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const password = "mysecurepassword";
      const hashedPassword = await hashPassword(password);

      const isMatch = comparePassword(password, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const password = "mysecurepassword";
      const wrongPassword = "wrongpassword";
      const hashedPassword = await hashPassword(password);

      const isMatch = comparePassword(wrongPassword, hashedPassword);

      expect(isMatch).toBe(false);
    });

    it("should return false for empty password against hash", async () => {
      const password = "mysecurepassword";
      const hashedPassword = await hashPassword(password);

      const isMatch = comparePassword("", hashedPassword);

      expect(isMatch).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const password = "MySecurePassword";
      const hashedPassword = await hashPassword(password);

      const isMatch = comparePassword("mysecurepassword", hashedPassword);

      expect(isMatch).toBe(false);
    });
  });
});
