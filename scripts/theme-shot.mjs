// Chụp home ở chế độ light + dark để kiểm tra panel sơn mài (hero/footer/header) đã theo theme.
import { chromium } from "playwright-core";

const BASE = "http://127.0.0.1:3000";

async function main() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const theme of ["light", "dark"]) {
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t);
      } catch {}
    }, theme);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `theme-${theme}.png`, fullPage: false });
    // Đo màu nền thực tế của hero + footer
    const info = await page.evaluate(() => {
      const hero = document.querySelector("section.texture-lacquer");
      const footer = document.querySelector("footer.texture-lacquer");
      const cs = getComputedStyle(hero || document.body);
      const cf = getComputedStyle(footer || document.body);
      const read = (el) =>
        el ? getComputedStyle(el).backgroundColor : "none";
      const h1 = document.querySelector("h1");
      return {
        heroBg: cs.backgroundColor,
        heroText: read(h1),
        footerBg: cf.backgroundColor,
      };
    });
    console.log(`${theme}: heroBg=${info.heroBg} h1=${info.heroText} footerBg=${info.footerBg}`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});