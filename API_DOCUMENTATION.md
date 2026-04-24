# Dokumentasi API - CV Builder Application

## 📋 Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Tech Stack](#tech-stack)
3. [Setup & Konfigurasi](#setup--konfigurasi)
4. [Autentikasi](#autentikasi)
5. [Skema Database](#skema-database)
6. [Endpoint API](#endpoint-api)
7. [Format Response](#format-response)
8. [Penanganan Error](#penanganan-error)
9. [Contoh Penggunaan](#contoh-penggunaan)

---

## Pendahuluan

**CV Builder Application** adalah aplikasi web full-stack yang memungkinkan pengguna untuk membuat, mengedit, dan mengelola Curriculum Vitae (CV) mereka secara digital. Aplikasi ini mengintegrasikan berbagai teknologi modern untuk memberikan pengalaman pengguna yang seamless.

### Fitur Utama:

- 📝 **Autentikasi Pengguna**: Registrasi, login dengan email/password, dan OAuth (Google & GitHub)
- 📄 **Manajemen CV**: Buat, baca, update, dan hapus CV
- 💼 **Manajemen Pengalaman Kerja**: Tambah pengalaman kerja ke CV
- 🤖 **AI Review**: Review CV menggunakan Gemini AI
- 📥 **Upload PDF**: Upload CV dalam format PDF dan ekstrak data
- 💾 **Download CV**: Unduh CV dalam format PDF
- 🖼️ **Upload Foto**: Upload foto profil untuk CV
- **Otorisasi**: Pengguna hanya bisa mengakses CV mereka sendiri

---

## Tech Stack

### Backend

- **Framework**: Express.js v5.2.1
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Autentikasi**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **File Upload**: Cloudinary, Multer
- **PDF Generation**: Puppeteer
- **AI Integration**: Google Gemini API
- **OAuth**: Google OAuth 2.0, GitHub OAuth 2.0
- **Testing**: Jest, Supertest

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Router**: React Router
- **HTTP Client**: Axios

### Port Configuration

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

---

## Setup & Konfigurasi

### Prasyarat

- Node.js (v16 atau lebih tinggi)
- PostgreSQL
- npm atau yarn

### Instalasi Backend

```bash
# 1. Navigasi ke folder server
cd server

# 2. Install dependencies
npm install

# 3. Buat file .env berdasarkan environment yang ada
cp .env.example .env

# 4. Konfigurasi database di .env
DATABASE_URL=postgresql://username:password@localhost:5432/db_cv_builder

# 5. Jalankan migrasi
npm run migrate

# 6. (Opsional) Jalankan seeder
npm run seed

# 7. Jalankan aplikasi
npm run dev
```

### Instalasi Frontend

```bash
# 1. Navigasi ke folder client
cd client

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev
```

### Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_cv_builder

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Port
PORT=3000
```

---

## Autentikasi

### Jenis Autentikasi

#### 1. JWT Token (Email/Password)

- **Tipe**: Bearer Token
- **Lokasi**: Header `Authorization: Bearer <token>`
- **Durasi**: Sesuai konfigurasi JWT_SECRET
- **Payload Token**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "role": "User"
  }
  ```

#### 2. OAuth 2.0

- **Google**: Client-side authentication dengan token verification
- **GitHub**: Backend OAuth flow dengan code exchange

### Middleware Autentikasi

Semua endpoint yang memerlukan autentikasi akan menggunakan middleware `authentication`:

```javascript
// Header yang dibutuhkan
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware Otorisasi

Beberapa endpoint dilindungi middleware `authorization` untuk memastikan pengguna hanya mengakses resource mereka sendiri:

- `authorizationCV`: Verifikasi kepemilikan CV
- `authorizationExperience`: Verifikasi kepemilikan Experience

---

## Skema Database

### 1. User Table

```
┌─────────────────────────────┐
│          User               │
├─────────────────────────────┤
│ id (PK)          : INTEGER  │
│ name             : STRING   │
│ email            : STRING   │
│ password         : STRING   │
│ role             : STRING   │
│ createdAt        : DATETIME │
│ updatedAt        : DATETIME │
└─────────────────────────────┘
```

**Validasi**:

- `name`: Required, tidak boleh kosong
- `email`: Required, unique, format valid
- `password`: Required, minimal 6 karakter
- `role`: "User" atau "Admin" (default: "User")

---

### 2. CV Table

```
┌─────────────────────────────┐
│           CV                │
├─────────────────────────────┤
│ id (PK)          : INTEGER  │
│ userId (FK)      : INTEGER  │
│ fullName         : STRING   │
│ title            : STRING   │
│ summary          : TEXT     │
│ education        : TEXT     │
│ skills           : TEXT     │
│ photoUrl         : STRING   │
│ file             : STRING   │
│ createdAt        : DATETIME │
│ updatedAt        : DATETIME │
└─────────────────────────────┘
       ↓ (belongs to)
     User
```

**Validasi**:

- `userId`: Required
- `title`: Required, tidak boleh kosong
- `summary`: Required, tidak boleh kosong
- `education`: Required, tidak boleh kosong
- `skills`: Required, tidak boleh kosong
- `fullName`: Optional (nullable)
- `photoUrl`: Optional, harus URL valid
- `file`: Optional (untuk upload PDF)

**Relationship**:

- Satu User bisa punya banyak CV
- Satu CV bisa punya banyak Experience

---

### 3. Experience Table

```
┌─────────────────────────────┐
│       Experience            │
├─────────────────────────────┤
│ id (PK)          : INTEGER  │
│ cvId (FK)        : INTEGER  │
│ company          : STRING   │
│ position         : STRING   │
│ startDate        : DATE     │
│ endDate          : DATE     │
│ description      : TEXT     │
│ createdAt        : DATETIME │
│ updatedAt        : DATETIME │
└─────────────────────────────┘
       ↓ (belongs to)
      CV
```

**Validasi**:

- `cvId`: Required
- `company`: Required, tidak boleh kosong
- `position`: Required, tidak boleh kosong
- `startDate`: Required, format DATE
- `endDate`: Required, format DATE
- `description`: Required, tidak boleh kosong

**Relationship**:

- Satu CV bisa punya banyak Experience
- Satu Experience hanya punya satu CV (with CASCADE delete)

---

## Endpoint API

### A. Authentication Endpoints (`/auth`)

#### 1. Register - POST `/auth/register`

Mendaftarkan pengguna baru dengan email dan password.

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (201)**:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "User",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Response Error (400)**:

```json
{
  "error": "Email already registered"
}
```

**Status Code**:

- `201`: Registrasi berhasil
- `400`: Validasi gagal
- `500`: Server error

---

#### 2. Login - POST `/auth/login`

Login dengan email dan password untuk mendapatkan JWT token.

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6IlVzZXIiLCJpYXQiOjE2NzM3Nzk5MDAsImV4cCI6MTY3Mzc4MzUwMH0...."
}
```

**Response Error (401)**:

```json
{
  "error": "Invalid Email/password"
}
```

**Status Code**:

- `200`: Login berhasil
- `400`: Email atau password tidak diisi
- `401`: Email/password salah
- `500`: Server error

---

#### 3. Google Login - GET `/auth/google`

Redirect ke Google OAuth login page (backend OAuth flow initialization).

**Parameter**: Tidak ada

**Response**:

- Redirect ke Google OAuth authorization page
- User akan diminta untuk memberikan permission

**Status Code**:

- `302`: Redirect ke Google

---

#### 4. Google Callback - GET `/auth/google/callback`

Callback URL setelah user authorize di Google (backend OAuth flow).

**Query Parameter**:

- `code`: Authorization code dari Google
- `state`: State untuk verifikasi CSRF (optional)

**Response Success (200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "Google User",
    "role": "User"
  }
}
```

**Response Error (401)**:

```json
{
  "error": "Google token failed"
}
```

---

#### 5. Google Verify - POST `/auth/google-verify`

Verifikasi token Google dari client-side dan generate JWT token.

**Request Body**:

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response Success (200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "Google User",
    "role": "User"
  }
}
```

**Response Error (401)**:

```json
{
  "error": "Invalid Google token"
}
```

---

#### 6. GitHub Login - GET `/auth/github`

Redirect ke GitHub OAuth login page.

**Parameter**: Tidak ada

**Response**:

- Redirect ke GitHub OAuth authorization page

**Status Code**:

- `302`: Redirect ke GitHub

---

#### 7. GitHub Callback - GET `/auth/github/callback`

Callback URL setelah user authorize di GitHub.

**Query Parameter**:

- `code`: Authorization code dari GitHub

**Response Success (200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@github.com",
    "name": "GitHub User",
    "role": "User"
  }
}
```

---

### B. CV Management Endpoints (`/cvs`)

**Semua endpoint memerlukan autentikasi (JWT Token)**

#### 1. Create CV - POST `/cvs`

Membuat CV baru.

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "fullName": "John Doe",
  "title": "Senior Software Engineer",
  "summary": "Experienced fullstack developer with 5 years of experience",
  "education": "Bachelor of Computer Science - University of XYZ (2019)",
  "skills": "JavaScript, React, Node.js, PostgreSQL, Docker",
  "photoUrl": "https://example.com/photo.jpg"
}
```

**Response Success (201)**:

```json
{
  "id": 1,
  "userId": 1,
  "fullName": "John Doe",
  "title": "Senior Software Engineer",
  "summary": "Experienced fullstack developer with 5 years of experience",
  "education": "Bachelor of Computer Science - University of XYZ (2019)",
  "skills": "JavaScript, React, Node.js, PostgreSQL, Docker",
  "photoUrl": "https://example.com/photo.jpg",
  "file": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Response Error (400)**:

```json
{
  "error": "Title is required"
}
```

**Status Code**:

- `201`: CV berhasil dibuat
- `400`: Validasi gagal
- `401`: Tidak terautentikasi
- `500`: Server error

---

#### 2. Get All CVs - GET `/cvs`

Mendapatkan semua CV milik user yang sedang login.

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Query Parameter**: Tidak ada

**Response Success (200)**:

```json
[
  {
    "id": 1,
    "userId": 1,
    "fullName": "John Doe",
    "title": "Senior Software Engineer",
    "summary": "Experienced fullstack developer...",
    "education": "Bachelor of Computer Science...",
    "skills": "JavaScript, React, Node.js...",
    "photoUrl": "https://example.com/photo.jpg",
    "file": null,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "fullName": "Jane Doe",
    "title": "Product Manager",
    "summary": "Experienced product manager...",
    "education": "MBA - Business School...",
    "skills": "Product Strategy, Leadership...",
    "photoUrl": null,
    "file": null,
    "createdAt": "2025-01-16T11:20:00.000Z",
    "updatedAt": "2025-01-16T11:20:00.000Z"
  }
]
```

**Response Error (401)**:

```json
{
  "error": "Unauthorized"
}
```

**Status Code**:

- `200`: Berhasil mendapatkan data
- `401`: Tidak terautentikasi
- `500`: Server error

---

#### 3. Get Detail CV - GET `/cvs/:id`

Mendapatkan detail CV dengan semua experiences-nya.

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Path Parameter**:

- `id`: ID CV (required)

**Response Success (200)**:

```json
{
  "id": 1,
  "userId": 1,
  "fullName": "John Doe",
  "title": "Senior Software Engineer",
  "summary": "Experienced fullstack developer with 5 years of experience",
  "education": "Bachelor of Computer Science - University of XYZ (2019)",
  "skills": "JavaScript, React, Node.js, PostgreSQL, Docker",
  "photoUrl": "https://example.com/photo.jpg",
  "file": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "User": {
    "name": "John Doe"
  },
  "Experiences": [
    {
      "id": 1,
      "cvId": 1,
      "company": "Tech Company",
      "position": "Senior Developer",
      "startDate": "2022-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "description": "Developed and maintained backend services",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Response Error (404)**:

```json
{
  "error": "CV Not Found"
}
```

**Status Code**:

- `200`: CV ditemukan
- `404`: CV tidak ditemukan
- `401`: Tidak terautentikasi
- `500`: Server error

---

#### 4. Update CV - PUT `/cvs/:id`

Update CV (hanya untuk owner dari CV tersebut).

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameter**:

- `id`: ID CV (required)

**Request Body** (minimal satu field):

```json
{
  "fullName": "John Doe Updated",
  "title": "Principal Engineer",
  "summary": "Updated summary...",
  "education": "Updated education...",
  "skills": "Updated skills...",
  "photoUrl": "https://example.com/new-photo.jpg"
}
```

**Response Success (200)**:

```json
{
  "id": 1,
  "userId": 1,
  "fullName": "John Doe Updated",
  "title": "Principal Engineer",
  "summary": "Updated summary...",
  "education": "Updated education...",
  "skills": "Updated skills...",
  "photoUrl": "https://example.com/new-photo.jpg",
  "file": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T15:45:00.000Z"
}
```

**Response Error (403)**:

```json
{
  "error": "Forbidden - You are not the owner"
}
```

**Status Code**:

- `200`: Update berhasil
- `400`: Validasi gagal
- `401`: Tidak terautentikasi
- `403`: Bukan owner CV
- `404`: CV tidak ditemukan
- `500`: Server error

---

#### 5. Delete CV - DELETE `/cvs/:id`

Menghapus CV (hanya untuk owner dari CV tersebut).

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Path Parameter**:

- `id`: ID CV (required)

**Response Success (200)**:

```json
{
  "message": "CV deleted"
}
```

**Response Error (403)**:

```json
{
  "error": "Forbidden - You are not the owner"
}
```

**Status Code**:

- `200`: Hapus berhasil
- `401`: Tidak terautentikasi
- `403`: Bukan owner CV
- `404`: CV tidak ditemukan
- `500`: Server error

---

#### 6. Review CV with AI - GET `/cvs/:id/review`

Review CV menggunakan Gemini AI (hanya untuk owner).

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Path Parameter**:

- `id`: ID CV (required)

**Response Success (200)**:

```json
{
  "review": "CV Anda sangat bagus! Beberapa saran: ...",
  "suggestions": [
    "Tambahkan lebih banyak technical skills",
    "Perjelas achievement di setiap pengalaman",
    "Update dengan project terbaru"
  ]
}
```

**Status Code**:

- `200`: Review berhasil
- `401`: Tidak terautentikasi
- `403`: Bukan owner CV
- `404`: CV tidak ditemukan
- `500`: Server error

---

#### 7. Download CV - GET `/cvs/:id/download`

Download CV dalam format PDF (hanya untuk owner).

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Path Parameter**:

- `id`: ID CV (required)

**Response**:

- File PDF (binary)
- Header: `Content-Type: application/pdf`
- Nama file: `{fullName}_CV.pdf`

**Status Code**:

- `200`: File PDF berhasil
- `401`: Tidak terautentikasi
- `403`: Bukan owner CV
- `404`: CV tidak ditemukan
- `500`: Server error

---

#### 8. Upload CV from PDF - POST `/cvs/upload`

Membuat CV baru dari file PDF yang di-upload dan ekstrak data menggunakan AI.

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body** (multipart):

```
file: <PDF_FILE>
```

**Response Success (201)**:

```json
{
  "id": 1,
  "userId": 1,
  "fullName": "John Doe",
  "title": "Senior Software Engineer",
  "summary": "Extracted summary from PDF...",
  "education": "Bachelor of Computer Science",
  "skills": "JavaScript, React, Node.js",
  "file": "url/to/uploaded/pdf",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Status Code**:

- `201`: CV dari PDF berhasil dibuat
- `400`: File tidak valid
- `401`: Tidak terautentikasi
- `500`: Server error

---

#### 9. Review Uploaded PDF - POST `/cvs/review-upload`

Review PDF yang di-upload tanpa menyimpannya.

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body** (multipart):

```
file: <PDF_FILE>
```

**Response Success (200)**:

```json
{
  "review": "PDF CV Anda sangat bagus! Saran: ...",
  "extractedData": {
    "fullName": "John Doe",
    "title": "Senior Software Engineer",
    "summary": "Extracted content...",
    "education": "Bachelor of Computer Science",
    "skills": "JavaScript, React, Node.js"
  }
}
```

**Status Code**:

- `200`: Review berhasil
- `400`: File tidak valid
- `401`: Tidak terautentikasi
- `500`: Server error

---

#### 10. Update CV Cover Image - PATCH `/cvs/:id/imageUrl`

Upload dan update foto profil CV (hanya untuk owner).

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Path Parameter**:

- `id`: ID CV (required)

**Request Body** (multipart):

```
uploadImage: <IMAGE_FILE>
```

**Response Success (200)**:

```json
{
  "id": 1,
  "userId": 1,
  "photoUrl": "https://cloudinary.com/image_url",
  "updatedAt": "2025-01-15T15:45:00.000Z"
}
```

**Status Code**:

- `200`: Update foto berhasil
- `400`: File tidak valid
- `401`: Tidak terautentikasi
- `403`: Bukan owner CV
- `404`: CV tidak ditemukan
- `500`: Server error

---

### C. Experience Management Endpoints (`/experiences`)

**Semua endpoint memerlukan autentikasi (JWT Token)**

#### 1. Create Experience - POST `/experiences`

Membuat pengalaman kerja baru untuk CV.

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "cvId": 1,
  "company": "Tech Startup",
  "position": "Backend Developer",
  "startDate": "2023-01-15",
  "endDate": "2024-12-31",
  "description": "Developed REST APIs and database systems using Node.js and PostgreSQL"
}
```

**Response Success (201)**:

```json
{
  "id": 1,
  "cvId": 1,
  "company": "Tech Startup",
  "position": "Backend Developer",
  "startDate": "2023-01-15T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "description": "Developed REST APIs and database systems using Node.js and PostgreSQL",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Response Error (404)**:

```json
{
  "error": "CV Not Found"
}
```

**Status Code**:

- `201`: Experience berhasil dibuat
- `400`: Validasi gagal
- `401`: Tidak terautentikasi
- `404`: CV tidak ditemukan
- `500`: Server error

---

#### 2. Get Experiences by CV - GET `/experiences/cv/:cvId`

Mendapatkan semua pengalaman kerja untuk CV tertentu (diurutkan dari terbaru).

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Path Parameter**:

- `cvId`: ID CV (required)

**Response Success (200)**:

```json
[
  {
    "id": 1,
    "cvId": 1,
    "company": "Tech Startup",
    "position": "Backend Developer",
    "startDate": "2023-01-15T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "description": "Developed REST APIs and database systems",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "cvId": 1,
    "company": "Previous Company",
    "position": "Junior Developer",
    "startDate": "2021-06-01T00:00:00.000Z",
    "endDate": "2023-01-14T00:00:00.000Z",
    "description": "Learned full-stack development",
    "createdAt": "2025-01-15T10:35:00.000Z",
    "updatedAt": "2025-01-15T10:35:00.000Z"
  }
]
```

**Status Code**:

- `200`: Berhasil mendapatkan data
- `401`: Tidak terautentikasi
- `500`: Server error

---

#### 3. Update Experience - PUT `/experiences/:id`

Update pengalaman kerja (hanya untuk owner dari CV yang bersangkutan).

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameter**:

- `id`: ID Experience (required)

**Request Body** (minimal satu field):

```json
{
  "company": "Tech Company Updated",
  "position": "Senior Backend Developer",
  "startDate": "2023-01-15",
  "endDate": "2024-12-31",
  "description": "Updated description..."
}
```

**Response Success (200)**:

```json
{
  "id": 1,
  "cvId": 1,
  "company": "Tech Company Updated",
  "position": "Senior Backend Developer",
  "startDate": "2023-01-15T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "description": "Updated description...",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T16:00:00.000Z"
}
```

**Response Error (403)**:

```json
{
  "error": "Forbidden - You are not the owner"
}
```

**Status Code**:

- `200`: Update berhasil
- `400`: Validasi gagal
- `401`: Tidak terautentikasi
- `403`: Bukan owner
- `404`: Experience tidak ditemukan
- `500`: Server error

---

#### 4. Delete Experience - DELETE `/experiences/:id`

Menghapus pengalaman kerja (hanya untuk owner dari CV yang bersangkutan).

**Request Header**:

```
Authorization: Bearer <access_token>
```

**Path Parameter**:

- `id`: ID Experience (required)

**Response Success (200)**:

```json
{
  "message": "Experience deleted"
}
```

**Status Code**:

- `200`: Hapus berhasil
- `401`: Tidak terautentikasi
- `403`: Bukan owner
- `404`: Experience tidak ditemukan
- `500`: Server error

---

#### 5. Bulk Create Experiences - POST `/experiences/bulk`

Membuat multiple pengalaman kerja sekaligus (mengganti semua experience di CV).

**Request Header**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "cvId": 1,
  "experiences": [
    {
      "company": "Tech Startup",
      "position": "Backend Developer",
      "startDate": "2023-01-15",
      "endDate": "2024-12-31",
      "description": "Developed REST APIs"
    },
    {
      "company": "Previous Company",
      "position": "Junior Developer",
      "startDate": "2021-06-01",
      "endDate": "2023-01-14",
      "description": "Learned full-stack development"
    }
  ]
}
```

**Response Success (201)**:

```json
{
  "message": "Experiences created"
}
```

**Status Code**:

- `201`: Bulk create berhasil
- `400`: Validasi gagal
- `401`: Tidak terautentikasi
- `500`: Server error

---

## Format Response

### Success Response Format

Semua response success mengikuti format berikut:

```json
{
  "data": {
    // Response data sesuai endpoint
  },
  // atau langsung object/array tanpa wrapper
  {
    "id": 1,
    "name": "...",
    // fields lainnya
  }
}
```

### Error Response Format

Semua response error mengikuti format berikut:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning               | Penggunaan                                |
| ---- | --------------------- | ----------------------------------------- |
| 200  | OK                    | Request berhasil                          |
| 201  | Created               | Resource berhasil dibuat                  |
| 204  | No Content            | Request berhasil, tidak ada response body |
| 400  | Bad Request           | Validasi gagal atau parameter tidak valid |
| 401  | Unauthorized          | Tidak terautentikasi atau token invalid   |
| 403  | Forbidden             | User tidak punya akses ke resource        |
| 404  | Not Found             | Resource tidak ditemukan                  |
| 500  | Internal Server Error | Terjadi error di server                   |
| 502  | Bad Gateway           | Error komunikasi dengan external service  |
| 503  | Service Unavailable   | Server sedang maintenance                 |

---

## Penanganan Error

### Jenis Error

#### 1. Validation Error (400)

Terjadi ketika input tidak memenuhi validasi yang ditetapkan.

```json
{
  "error": "Title is required",
  "statusCode": 400
}
```

#### 2. Authentication Error (401)

Terjadi ketika user belum login atau token sudah expired.

```json
{
  "error": "Unauthorized - Please login first",
  "statusCode": 401
}
```

#### 3. Authorization Error (403)

Terjadi ketika user tidak punya akses ke resource.

```json
{
  "error": "Forbidden - You are not the owner",
  "statusCode": 403
}
```

#### 4. Not Found Error (404)

Terjadi ketika resource tidak ditemukan.

```json
{
  "error": "CV Not Found",
  "statusCode": 404
}
```

#### 5. Server Error (500)

Terjadi ketika ada error di server.

```json
{
  "error": "Internal Server Error",
  "statusCode": 500
}
```

### Error Handling Best Practices

1. **Always check response status code**

   ```javascript
   if (response.status !== 200) {
     console.error("Error:", response.data.error);
   }
   ```

2. **Implement retry logic for 5xx errors**

   ```javascript
   if (response.status >= 500) {
     // Retry after delay
   }
   ```

3. **Handle network errors**
   ```javascript
   try {
     const response = await fetch(url);
   } catch (error) {
     console.error("Network error:", error);
   }
   ```

---

## Contoh Penggunaan

### Using cURL

#### 1. Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Create CV

```bash
curl -X POST http://localhost:3000/cvs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "title": "Senior Software Engineer",
    "summary": "Experienced developer",
    "education": "Bachelor of Computer Science",
    "skills": "JavaScript, React, Node.js"
  }'
```

#### 4. Get All CVs

```bash
curl -X GET http://localhost:3000/cvs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 5. Create Experience

```bash
curl -X POST http://localhost:3000/experiences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "cvId": 1,
    "company": "Tech Startup",
    "position": "Backend Developer",
    "startDate": "2023-01-15",
    "endDate": "2024-12-31",
    "description": "Developed REST APIs"
  }'
```

### Using JavaScript/Fetch

```javascript
// Register
async function register() {
  const response = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    }),
  });

  const data = await response.json();
  console.log(data);
}

// Login
async function login() {
  const response = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "john@example.com",
      password: "password123",
    }),
  });

  const data = await response.json();
  const token = data.access_token;
  localStorage.setItem("token", token);
  console.log("Login successful");
}

// Get CVs
async function getCVs() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/cvs", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  console.log(data);
}

// Create CV
async function createCV() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/cvs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: "John Doe",
      title: "Senior Engineer",
      summary: "Experienced developer",
      education: "Bachelor of CS",
      skills: "JavaScript, React, Node.js",
      photoUrl: "https://example.com/photo.jpg",
    }),
  });

  const data = await response.json();
  console.log(data);
}
```

### Using Axios

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
async function register(name, email, password) {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    console.log("Register successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Register failed:", error.response.data);
  }
}

// Login
async function login(email, password) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", response.data.access_token);
    console.log("Login successful");
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response.data);
  }
}

// Get all CVs
async function getCVs() {
  try {
    const response = await api.get("/cvs");
    console.log("CVs:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get CVs failed:", error.response.data);
  }
}

// Create CV
async function createCV(cvData) {
  try {
    const response = await api.post("/cvs", cvData);
    console.log("CV created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Create CV failed:", error.response.data);
  }
}

// Create Experience
async function createExperience(experienceData) {
  try {
    const response = await api.post("/experiences", experienceData);
    console.log("Experience created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Create experience failed:", error.response.data);
  }
}

// Update CV
async function updateCV(cvId, cvData) {
  try {
    const response = await api.put(`/cvs/${cvId}`, cvData);
    console.log("CV updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update CV failed:", error.response.data);
  }
}

// Delete CV
async function deleteCV(cvId) {
  try {
    const response = await api.delete(`/cvs/${cvId}`);
    console.log("CV deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete CV failed:", error.response.data);
  }
}

// Get detail CV
async function getDetailCV(cvId) {
  try {
    const response = await api.get(`/cvs/${cvId}`);
    console.log("CV detail:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get CV detail failed:", error.response.data);
  }
}

// Get experiences for CV
async function getExperiences(cvId) {
  try {
    const response = await api.get(`/experiences/cv/${cvId}`);
    console.log("Experiences:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get experiences failed:", error.response.data);
  }
}
```

---

## Testing API

### Run Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test cv.test.js

# Run with coverage
npm run test:coverage

# Run with verbose output
npm test -- --verbose
```

### Test Files Location

- `server/__tests__/auth.test.js` - Authentication tests
- `server/__tests__/cv.test.js` - CV management tests
- `server/__tests__/experience.test.js` - Experience management tests
- `server/__tests__/AuthController.test.js` - Auth controller tests
- `server/__tests__/CvController.test.js` - CV controller tests
- `server/__tests__/ExperienceController.test.js` - Experience controller tests

---

## Security Considerations

### 1. JWT Token Security

- Token disimpan di localStorage (frontend)
- Token di-attach ke setiap request authenticated
- Token memiliki expiration time
- Never log or expose token di console

### 2. Password Security

- Password di-hash menggunakan bcryptjs
- Minimum 6 karakter
- Never return password di response

### 3. CORS Configuration

- Backend mengaktifkan CORS untuk frontend
- Hanya allow specific origin di production

### 4. Authorization

- User hanya bisa akses CV mereka sendiri
- User hanya bisa update/delete CV dan Experience milik mereka
- Middleware otomatis cek kepemilikan resource

### 5. Input Validation

- Semua input di-validate di backend
- Email format di-validate
- URL di-validate
- Date format di-validate

---

## Performance Tips

### 1. Caching

- PDF di-cache selama 5 menit untuk mengurangi load
- Maximum 50 PDF dapat di-cache

### 2. Pagination

- Implementasi pagination untuk list endpoint (future improvement)
- Limit hasil untuk mengurangi bandwidth

### 3. Database

- Use index pada frequently queried fields
- Lazy load relationships
- Use batching untuk bulk operations

### 4. Frontend

- Lazy load components
- Implement virtual scrolling untuk list panjang
- Cache API responses

---

## Deployment

### Backend Deployment

```bash
# Build
npm run build

# Deploy to Heroku
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set GOOGLE_CLIENT_ID=your_id
```

### Frontend Deployment

```bash
# Build
npm run build

# Deploy to Vercel
npm install -g vercel
vercel

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## Support & Troubleshooting

### Common Issues

#### 1. CORS Error

**Problem**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:

```javascript
// Make sure backend has CORS enabled
app.use(cors());
```

#### 2. Token Expired

**Problem**: `Invalid or expired token`

**Solution**:

```javascript
// Refresh token by logging in again
const newToken = await login(email, password);
localStorage.setItem("token", newToken);
```

#### 3. Database Connection Error

**Problem**: `Cannot connect to database`

**Solution**:

```bash
# Check database is running
psql -U postgres -d db_cv_builder

# Run migrations
npm run migrate
```

#### 4. File Upload Error

**Problem**: `File too large` atau `Invalid file type`

**Solution**:

- Check file size limit
- Verify file type (PDF, JPG, PNG)
- Check Cloudinary credentials

---

## API Versioning (Future)

Untuk kompatibilitas backward compatibility, API akan di-version:

```
/api/v1/auth/...
/api/v1/cvs/...
/api/v1/experiences/...
```

---

## Rate Limiting (Future)

Implementasi rate limiting untuk mencegah abuse:

```
- 100 requests per 15 minutes per IP
- 50 requests per 15 minutes per user
```

---

## Monitoring & Logging

### Implemented Logging

- Request logging (method, URL, status)
- Error logging (error stack trace)
- Database query logging (debug mode)

### Future Monitoring

- Application performance monitoring (APM)
- Error tracking (Sentry)
- Analytics tracking

---

**Last Updated**: April 24, 2026

**API Version**: 1.0.0

**Contact**: development@cvbuilder.com
