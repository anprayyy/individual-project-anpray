const puppeteer = require("puppeteer");

const generatePDFBuffer = async (cv) => {
  // fetch foto ke base64
  let photoBase64 = "";
  if (cv.photoUrl) {
    try {
      const response = await fetch(cv.photoUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
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

    .contact-item {
      font-size: 11px;
      color: #94a3b8;
    }

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
            `
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

  return Buffer.from(pdfBuffer);
};

module.exports = { generatePDFBuffer };
