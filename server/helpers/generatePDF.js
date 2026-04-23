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

  const html = `...`; // HTML template yang sama seperti downloadCV

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

  // Pastikan return sebagai Buffer
  return Buffer.from(pdfBuffer);
};

module.exports = { generatePDFBuffer };
