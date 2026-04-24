# Testing Guide for CV Builder Backend

Comprehensive testing suite menggunakan **Jest** dan **Supertest**.

## 📦 Setup

### Install Dependencies

```bash
npm install --save-dev jest supertest
```

Package sudah tersedia di `package.json`. Install dengan:

```bash
npm install
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Setiap kali ada perubahan file, test akan otomatis re-run.

### Generate Coverage Report

```bash
npm run test:coverage
```

Akan generate report di folder `coverage/` dengan breakdown coverage per file.

---

## 📋 Test Files

### 1. **AuthController.test.js**

Test untuk authentication endpoints:

- ✅ User Registration
- ✅ User Login (Email/Password)
- ✅ Google OAuth Verification
- ✅ Error handling (invalid email, wrong password, etc)

**Test Cases:**

- 13 test cases total
- Happy path: Register, Login, Google Verify
- Error paths: Missing fields, Invalid credentials, Database errors

**Run single test file:**

```bash
npm test -- AuthController.test.js
```

---

### 2. **CvController.test.js**

Test untuk CV CRUD operations:

- ✅ Get All CVs
- ✅ Get CV by ID
- ✅ Create New CV
- ✅ Update CV
- ✅ Delete CV
- ✅ Download PDF

**Test Cases:**

- 16 test cases
- Authorization checks
- Database error handling
- Cache testing (if applicable)

**Run:**

```bash
npm test -- CvController.test.js
```

---

### 3. **ExperienceController.test.js**

Test untuk Experience CRUD operations:

- ✅ Create Experience
- ✅ Get All Experiences for CV
- ✅ Update Experience
- ✅ Delete Experience

**Test Cases:**

- 13 test cases
- Authorization & permission checks
- Validation testing

**Run:**

```bash
npm test -- ExperienceController.test.js
```

---

### 4. **Middleware.test.js**

Test untuk Authentication & Authorization middleware:

- ✅ JWT Token Verification
- ✅ User Authorization
- ✅ Role-based Access Control

**Test Cases:**

- 9 test cases
- Valid/Invalid token scenarios
- Multiple role support

**Run:**

```bash
npm test -- Middleware.test.js
```

---

### 5. **Helpers.test.js**

Test untuk utility helper functions:

- ✅ JWT Token Generation
- ✅ JWT Token Verification
- ✅ Password Hashing (Bcrypt)
- ✅ Password Comparison

**Test Cases:**

- 15 test cases
- Token generation consistency
- Hash uniqueness
- Case sensitivity

**Run:**

```bash
npm test -- Helpers.test.js
```

---

## 📊 Test Statistics

| File                         | Total Tests | Coverage                     |
| ---------------------------- | ----------- | ---------------------------- |
| AuthController.test.js       | 13          | Register, Login, GoogleOAuth |
| CvController.test.js         | 16          | CRUD + PDF Download          |
| ExperienceController.test.js | 13          | CRUD operations              |
| Middleware.test.js           | 9           | Auth + Authorization         |
| Helpers.test.js              | 15          | JWT + Bcrypt                 |
| **Total**                    | **66**      | **All major functions**      |

---

## 🎯 Jest Configuration

File: `jest.config.js`

```javascript
module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "helpers/**/*.js",
    "middlewares/**/*.js",
    "routers/**/*.js",
  ],
  testTimeout: 10000,
};
```

---

## 🔍 Understanding Test Output

### Success Output

```
 PASS  __tests__/AuthController.test.js
  AuthController
    POST /register
      ✓ should register a new user successfully (15ms)
      ✓ should fail to register without email (8ms)
    POST /login
      ✓ should login user with correct credentials (12ms)
      ✓ should fail with non-existent user (9ms)

Test Suites: 5 passed, 5 total
Tests:       66 passed, 66 total
```

### Failed Output

```
 FAIL  __tests__/AuthController.test.js
  AuthController
    POST /register
      ✗ should register a new user successfully (45ms)

Expected mock to have been called
```

---

## 🧬 Mocking Strategy

### Models Mocking

```javascript
jest.mock("../models", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));
```

### External API Mocking

```javascript
jest.mock("axios");
axios.get.mockResolvedValue({ data: {...} });
```

### Helper Functions Mocking

```javascript
jest.mock("../helpers/jwt");
signToken.mockReturnValue("jwt_token_123");
```

---

## 📝 Best Practices

### 1. **Test Organization**

- Group related tests dengan `describe`
- Use descriptive test names
- One assertion per test (when possible)

### 2. **Setup & Teardown**

```javascript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // cleanup
});
```

### 3. **Mock Data**

- Create reusable mock objects
- Use factories untuk complex objects
- Mock all external dependencies

### 4. **Assertions**

```javascript
expect(response.status).toBe(200);
expect(response.body).toHaveProperty("id");
expect(mockFunction).toHaveBeenCalled();
```

---

## 🚀 CI/CD Integration

Untuk production, jalankan tests di CI/CD pipeline:

```yaml
# GitHub Actions Example
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  run: npm run test:coverage
```

---

## ⚠️ Common Issues

### Issue: Tests timeout

**Solution:** Increase timeout di `jest.config.js`

```javascript
testTimeout: 10000, // 10 seconds
```

### Issue: Cannot find module

**Solution:** Pastikan path di mock statement benar

```javascript
jest.mock("../helpers/jwt"); // Relative path
```

### Issue: Mock tidak reset

**Solution:** Clear mocks di `beforeEach`

```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js Testing Best Practices](https://github.com/nodejs/nodejs.org/blob/master/locale/en/docs/guides/testing.md)

---

## 🤝 Contributing Tests

Saat menambah fitur baru:

1. Tulis test DULU (TDD approach)
2. Jalankan test (akan fail)
3. Implement fitur
4. Test akan pass
5. Refactor jika perlu

---

**Last Updated:** April 24, 2026  
**Tested With:** Node.js v18+, Jest v29+, Supertest v6+
