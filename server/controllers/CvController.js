const { User, CV, Experience, Payment } = require("../models");
const cloudinary = require("../config/cloudinary");
const puppeteer = require("puppeteer");
const { reviewCV, extractCVFromPDF } = require("../helpers/gemini");
const { generatePDFBuffer } = require("../helpers/generatePDF");

const PDF_CACHE_TTL_MS = 5 * 60 * 1000;
const PDF_CACHE_MAX = 50;
const pdfCache = new Map();

class CvController {
  static async createCV(req, res, next) {
    try {
      const { fullName, title, summary, education, skills } = req.body;

      const cv = await CV.create({
        fullName: fullName || null,
        title,
        summary,
        education,
        skills,
        userId: req.user.id,
        photoUrl: req.body.photoUrl || null,
      });

      res.status(201).json(cv);
    } catch (err) {
      next(err);
    }
  }
  static async getAllCV(req, res, next) {
    try {
      const cvs = await CV.findAll({
        where: {
          userId: req.user.id,
        },
      });

      res.status(200).json(cvs);
    } catch (err) {
      next(err);
    }
  }
  static async getDetailCV(req, res, next) {
    try {
      const { id } = req.params;

      const cv = await CV.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: Experience,
            order: [["startDate", "DESC"]],
          },
        ],
      });

      if (!cv) {
        throw { name: "NotFound", message: "CV Not Found" };
      }

      res.status(200).json(cv);
    } catch (err) {
      next(err);
    }
  }
  static async updateCV(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, title, summary, education, skills } = req.body;

      const cv = await CV.findByPk(id);

      if (!cv) {
        throw { name: "NotFound", message: "CV Not Found" };
      }

      await cv.update({
        fullName: fullName === undefined ? cv.fullName : fullName || null,
        title,
        summary,
        education,
        skills,
        photoUrl: req.body.photoUrl || cv.photoUrl,
      });

      res.status(200).json(cv);
    } catch (err) {
      next(err);
    }
  }
  static async deleteCV(req, res, next) {
    try {
      const { id } = req.params;

      const cv = await CV.findByPk(id);

      if (!cv) {
        throw { name: "NotFound", message: "CV Not Found" };
      }

      await cv.destroy();

      res.status(200).json({ message: "CV deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
  static async updateCVCoverUrlById(req, res, next) {
    try {
      const cvId = +req.params.id;

      const cv = await CV.findByPk(cvId);
      console.log(cv);

      if (!cv) {
        throw {
          name: "NotFound",
          message: `CV id ${cvId} not found`,
        };
      }

      if (!req.file) {
        throw {
          name: "BadRequest",
          message: "Image is required",
        };
      }

      if (!req.file.mimetype.startsWith("image/")) {
        throw {
          name: "BadRequest",
          message: "File must be an image",
        };
      }

      const base64Img = req.file.buffer.toString("base64");

      const base64DataUri = `data:${req.file.mimetype};base64,${base64Img}`;

      const result = await cloudinary.uploader.upload(base64DataUri);

      await cv.update({ photoUrl: result.secure_url });

      res.status(200).json({
        message: "Image uploaded successfully",
        photoUrl: result.secure_url,
      });
    } catch (err) {
      next(err);
    }
  }
  static async reviewUploadedCV(req, res, next) {
    try {
      if (!req.file) {
        throw { name: "BadRequest", message: "No PDF uploaded" };
      }

      // req.file.buffer berisi binary PDF langsung dari multer memoryStorage
      const pdfBuffer = Buffer.from(req.file.buffer);
      const review = await reviewCV(pdfBuffer);

      res.status(200).json({ review });
    } catch (err) {
      next(err);
    }
  }
  static async createCVFromUpload(req, res, next) {
    try {
      if (!req.file) {
        throw { name: "BadRequest", message: "No PDF uploaded" };
      }

      const pdfBuffer = Buffer.from(req.file.buffer);
      const aiText = await extractCVFromPDF(pdfBuffer);

      let extracted;
      try {
        extracted = JSON.parse(aiText);
      } catch (parseErr) {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw {
            name: "BadRequest",
            message: "AI response is not valid JSON",
          };
        }
        extracted = JSON.parse(jsonMatch[0]);
      }

      const normalizeDate = (value) => {
        if (!value) return new Date();
        if (typeof value === "string") {
          const trimmed = value.trim().toLowerCase();
          if (trimmed === "n/a" || trimmed === "na") return new Date();
          if (trimmed.includes("present") || trimmed.includes("current")) {
            return new Date();
          }
        }
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
      };

      const safeText = (value, fallback) => {
        if (!value || value === "N/A") return fallback;
        return String(value);
      };

      const fullName = safeText(extracted.fullName || extracted.name, "");
      const title = safeText(extracted.title, "Untitled CV");
      const summary = safeText(extracted.summary, "Summary not provided");
      const education = safeText(extracted.education, "N/A");
      const skills = safeText(extracted.skills, "N/A");

      const experiences = Array.isArray(extracted.experiences)
        ? extracted.experiences
        : [];

      const created = await CV.sequelize.transaction(async (transaction) => {
        const cv = await CV.create(
          {
            fullName: fullName || null,
            title,
            summary,
            education,
            skills,
            userId: req.user.id,
          },
          { transaction },
        );

        if (experiences.length > 0) {
          const expPayload = experiences.map((exp) => ({
            cvId: cv.id,
            company: safeText(exp.company, "N/A"),
            position: safeText(exp.position, "N/A"),
            startDate: normalizeDate(exp.startDate),
            endDate: normalizeDate(exp.endDate),
            description: safeText(exp.description, "N/A"),
          }));

          await Experience.bulkCreate(expPayload, { transaction });
        }

        return cv;
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
  static async downloadCV(req, res, next) {
    try {
      const { id } = req.params;

      const cv = await CV.findByPk(id, {
        include: { model: Experience },
      });

      if (!cv) {
        throw { name: "NotFound", message: "CV Not Found" };
      }

      const cacheKey = String(cv.id);
      const cached = pdfCache.get(cacheKey);
      if (
        cached &&
        cached.updatedAt === cv.updatedAt?.toISOString() &&
        Date.now() - cached.createdAt < PDF_CACHE_TTL_MS
      ) {
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=cv-${cv.id}.pdf`,
        });
        res.send(cached.buffer);
        return;
      }

      // Convert photo URL to base64 agar bisa muncul di puppeteer
      let photoBase64 = "";
      if (cv.photoUrl) {
        try {
          const fetch = (await import("node-fetch")).default;
          const response = await fetch(cv.photoUrl);
          const buffer = await response.buffer();
          const mimeType = response.headers.get("content-type") || "image/jpeg";
          photoBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
        } catch (e) {
          console.log("Gagal fetch foto:", e.message);
        }
      }

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1a1a2e;
      background: #fff;
      font-size: 13px;
      line-height: 1.6;
    }

    .wrapper {
      display: flex;
      min-height: 100vh;
    }

    /* ── SIDEBAR ── */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: #1e293b;
      color: #e2e8f0;
      padding: 36px 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .photo-wrap {
      display: flex;
      justify-content: center;
    }

    .photo {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #334155;
    }

    .photo-placeholder {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: #94a3b8;
      font-weight: bold;
    }

    .sidebar-section h3 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #334155;
    }

    .sidebar-name {
      text-align: center;
    }

    .sidebar-name h1 {
      font-size: 18px;
      font-weight: 700;
      color: #f1f5f9;
      line-height: 1.3;
    }

    .sidebar-name p {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skill-item {
      background: #334155;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #cbd5e1;
    }

    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .contact-item {
      font-size: 11px;
      color: #94a3b8;
    }

    /* ── MAIN ── */
    .main {
      flex: 1;
      padding: 40px 36px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .main-header {
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 16px;
    }

    .main-role {
      font-size: 12px;
      color: #64748b;
      margin-top: 6px;
    }

    .main-header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .main-header p {
      font-size: 13px;
      color: #64748b;
      margin-top: 6px;
      line-height: 1.6;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #1e293b;
      margin-bottom: 14px;
      padding-bottom: 6px;
      border-bottom: 2px solid #1e293b;
    }

    .exp-item {
      margin-bottom: 16px;
      padding-left: 14px;
      border-left: 2px solid #e2e8f0;
      position: relative;
    }

    .exp-item::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1e293b;
    }

    .exp-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .exp-company {
      font-size: 12px;
      color: #475569;
      margin-top: 1px;
    }

    .exp-date {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
      font-style: italic;
    }

    .exp-desc {
      font-size: 12px;
      color: #475569;
      margin-top: 5px;
      line-height: 1.6;
    }

    .edu-text {
      font-size: 13px;
      color: #334155;
    }

    .no-exp {
      font-size: 12px;
      color: #94a3b8;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="photo-wrap">
        ${
          photoBase64
            ? `<img src="${photoBase64}" class="photo" />`
            : `<div class="photo-placeholder">${(cv.fullName || "CV")[0].toUpperCase()}</div>`
        }
      </div>

      <div class="sidebar-name">
        <h1>${cv.fullName || "—"}</h1>
        ${cv.title ? `<p>${cv.title}</p>` : ""}
      </div>

      ${
        cv.skills
          ? `<div class="sidebar-section">
              <h3>Skills</h3>
              <div class="skills-list">
                ${cv.skills
                  .split(",")
                  .map((s) => `<div class="skill-item">${s.trim()}</div>`)
                  .join("")}
              </div>
            </div>`
          : ""
      }

      <div class="sidebar-section">
        <h3>Education</h3>
        <div class="contact-list">
          <div class="contact-item">${cv.education || "—"}</div>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="main">

      <div class="main-header">
        <h1>${cv.fullName || "—"}</h1>
        ${cv.title ? `<p class="main-role">${cv.title}</p>` : ""}
        ${cv.summary ? `<p>${cv.summary}</p>` : ""}
      </div>

      <div>
        <div class="section-title">Work Experience</div>
        ${
          cv.Experiences && cv.Experiences.length > 0
            ? cv.Experiences.map(
                (exp) => `
              <div class="exp-item">
                <div class="exp-title">${exp.position || "—"}</div>
                <div class="exp-company">${exp.company || "—"}</div>
                <div class="exp-date">
                  ${new Date(exp.startDate).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                  —
                  ${
                    exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                        })
                      : "Present"
                  }
                </div>
                ${exp.description ? `<div class="exp-desc">${exp.description}</div>` : ""}
              </div>
            `,
              ).join("")
            : `<p class="no-exp">No experience listed.</p>`
        }
      </div>

    </div>
  </div>
</body>
</html>
    `;

      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await browser.close();

      const cacheEntry = {
        updatedAt: cv.updatedAt?.toISOString(),
        createdAt: Date.now(),
        buffer: pdfBuffer,
      };
      pdfCache.set(cacheKey, cacheEntry);
      if (pdfCache.size > PDF_CACHE_MAX) {
        const oldestKey = Array.from(pdfCache.entries()).sort(
          (a, b) => a[1].createdAt - b[1].createdAt,
        )[0]?.[0];
        if (oldestKey) pdfCache.delete(oldestKey);
      }

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=cv-${cv.id}.pdf`,
      });

      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  static async reviewCVWithAI(req, res, next) {
    try {
      const { id } = req.params;

      const cv = await CV.findByPk(id, {
        include: { model: Experience },
      });

      if (!cv) throw { name: "NotFound", message: "CV Not Found" };

      // Generate PDF buffer (reuse logic dari downloadCV)
      const pdfBuffer = await generatePDFBuffer(cv); // pisahkan jadi helper

      // Kirim ke Gemini
      const review = await reviewCV(pdfBuffer);

      res.status(200).json({ review });
    } catch (err) {
      console.log("ERROR REVIEW:", err); // tambah ini
      next(err);
    }
  }
}

module.exports = CvController;
