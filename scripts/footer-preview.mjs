import { chromium } from "playwright";

const browser = await chromium.launch();
const base = "http://localhost:3001";

for (const [name, width, height] of [
  ["mobile", 390, 844],
  ["desktop", 1440, 900],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => {
    const footer = document.querySelector("footer");
    if (footer) {
      const top =
        footer.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: "instant" });
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `footer-preview-${name}.png` });
  await page.close();
}

await browser.close();
console.log("Updated footer preview screenshots");
