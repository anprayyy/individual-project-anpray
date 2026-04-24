const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const reviewCV = async (pdfBuffer) => {
  // Pastikan convert ke Buffer dulu sebelum base64
  const buffer = Buffer.isBuffer(pdfBuffer)
    ? pdfBuffer
    : Buffer.from(pdfBuffer);

  const base64Data = buffer.toString("base64");

  const contents = [
    {
      text: `Kamu adalah recruiter senior dan career coach berpengalaman lebih dari 10 tahun.

Tugas kamu adalah menganalisis CV berikut secara mendalam dan memberikan feedback yang konstruktif, jujur, dan actionable.

Berikan response dalam format berikut:

## 📊 Skor Keseluruhan
Berikan skor dari 1-100 beserta alasan singkat.

## ✅ Kekuatan
Sebutkan 3-5 hal yang sudah bagus dari CV ini. Jelaskan kenapa itu menjadi nilai plus di mata recruiter.

## ⚠️ Kelemahan
Sebutkan 3-5 hal yang perlu diperbaiki. Jelaskan dampaknya jika tidak diperbaiki.

## 💡 Saran Perbaikan
Berikan saran konkret dan spesifik untuk setiap kelemahan yang disebutkan. Saran harus actionable dan bisa langsung diterapkan.

## 🎯 Kesimpulan
Berikan kesimpulan singkat apakah CV ini siap untuk dilamar ke perusahaan, dan posisi/level apa yang paling cocok berdasarkan CV ini.

Gunakan bahasa Indonesia yang profesional namun mudah dipahami.`, // prompt
    },
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
  });

  return response.text;
};

const extractCVFromPDF = async (pdfBuffer) => {
  const buffer = Buffer.isBuffer(pdfBuffer)
    ? pdfBuffer
    : Buffer.from(pdfBuffer);

  const base64Data = buffer.toString("base64");

  const contents = [
    {
      text: `Ekstrak data dari CV berikut dan kembalikan HANYA JSON valid tanpa markdown.

Skema JSON:
{
  "fullName": "",
  "title": "",
  "summary": "",
  "education": "",
  "skills": "skill1, skill2",
  "experiences": [
    {
      "company": "",
      "position": "",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD atau kosong jika masih bekerja",
      "description": ""
    }
  ]
}

Jika ada field yang tidak ditemukan, isi string kosong atau array kosong.`,
    },
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
  });

  return response.text;
};

module.exports = { reviewCV, extractCVFromPDF };
