// Smoke test admin UI: đăng nhập admin qua API auth (node fetch -> inject cookie vào browser),
// rồi render từng trang admin bằng Playwright + Edge.
import fs from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { chromium } from "playwright-core";

const BASE = "http://127.0.0.1:3000";

// Parse .env trực tiếp (không phụ thuộc shell/env quy ước).
function loadEnv(file = ".env") {
  const out = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}
const env = loadEnv();
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Thiếu ADMIN_EMAIL/ADMIN_PASSWORD trong .env");

const PAGES = [
  { path: "/admin", expect: "Tổng quan" },
  { path: "/admin/don-hang", expect: "Đơn hàng" },
  { path: "/admin/san-pham", expect: "Sản phẩm" },
  { path: "/admin/san-pham/moi", expect: "Thêm sản phẩm" },
  { path: "/admin/chuyen-muc", expect: "Chuyên mục" },
  { path: "/admin/chuyen-muc/moi", expect: "Thêm chuyên mục" },
  { path: "/admin/khach-hang", expect: "Khách hàng" },
  { path: "/admin/tai-file", expect: "Lịch sử tải file" },
];

async function main() {
  // 1. Đồng bộ mật khẩu admin với .env (đảm bảo login được)
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const upd = await mongoose.connection.db
    .collection("users")
    .updateOne({ email: ADMIN_EMAIL }, { $set: { passwordHash: hash, role: "ADMIN" } });
  console.log(`✔ Admin sync (matched=${upd.matchedCount}, modified=${upd.modifiedCount})`);
  await mongoose.disconnect();

  // 2. Đăng nhập qua API auth bằng node fetch (tránh quirk browser/dev-HMR)
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, json: "true" }),
    redirect: "manual",
  });
  const setCookies = loginRes.headers.getSetCookie();
  console.log(`✔ Auth API: status=${loginRes.status}, cookies=${setCookies.length}`);
  if (!setCookies.length) {
    const rb = await loginRes.text().catch(() => "");
    if (loginRes.status === 302 && loginRes.headers.get("location")?.includes("error")) {
      throw new Error(`Login fail — redirect: ${loginRes.headers.get("location")}`);
    }
    throw new Error(`Login fail — không nhận được cookie (body: ${rb.slice(0, 120)})`);
  }

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1380, height: 1000 }, locale: "vi-VN" });
  await context.addCookies(
    setCookies.map((sc) => {
      const [nv, ...parts] = sc.split(";");
      const eq = nv.indexOf("=");
      const cookie = {
        name: nv.slice(0, eq),
        value: nv.slice(eq + 1),
        domain: "127.0.0.1",
        path: "/",
      };
      for (const p of parts) {
        const [k, v] = p.trim().split("=");
        if (k === "Path" && v) cookie.path = v;
        if (k === "Max-Age" || k === "Expires") {}
      }
      return cookie;
    }),
  );
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 250)));
  page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 250)));

  // 3. Render từng trang admin
  const results = [];
  for (const p of PAGES) {
    try {
      await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      const body = await page.textContent("body");
      const shell = body.includes("Bảng điều khiển");
      const has = body.includes(p.expect);
      const items = shell && has;
      results.push({ path: p.path, ok: items });
      console.log(`${items ? "✔" : "✘"} ${p.path} — shell=${shell} content=${has}`);
    } catch (e) {
      results.push({ path: p.path, ok: false });
      console.log(`✘ ${p.path} — ${String(e).slice(0, 180)}`);
    }
  }

  // 4. Mở chi tiết đơn hàng đầu tiên nếu có (chỉ đọc)
  try {
    await page.goto(`${BASE}/admin/don-hang`, { waitUntil: "networkidle" });
    const first = page.locator('a[href*="/admin/don-hang/"]').first();
    if (await first.count()) {
      const href = await first.getAttribute("href");
      await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const b = await page.textContent("body");
      const ok = b.includes("Cập nhật trạng thái");
      results.push({ path: `detail:${href}`, ok });
      console.log(`${ok ? "✔" : "✘"} detail:${href}`);
    } else {
      console.log("– không có đơn nào để test chi tiết");
    }
  } catch (e) {
    console.log(`✘ chi tiết đơn — ${String(e).slice(0, 180)}`);
  }

  console.log("\n--- Console errors (browser) ---");
  consoleErrors.slice(0, 8).forEach((e) => console.log("  " + e));
  if (consoleErrors.length === 0) console.log("  (không có)");

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nKẾT QUẢ: ${results.length - failed.length}/${results.length} PASS`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});