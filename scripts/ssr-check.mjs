// Kiểm tra SSR toàn bộ trang admin + trang chính bằng node fetch (cookie session admin).
// Xác nhận mỗi trang trả 200 và chứa nội dung kỳ vọng.
import fs from "node:fs";
import mongoose from "mongoose";

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
const BASE = "http://127.0.0.1:3000";

async function main() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  // Lấy id thật để test trang chi tiết
  const aUser = await mongoose.connection.db.collection("users").findOne({});
  const paidOrder = await mongoose.connection.db
    .collection("orders")
    .findOne({ status: "PAID", items: { $exists: true, $ne: [] } }, { sort: { createdAt: -1 } });
  await mongoose.disconnect();

  // Login admin
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = csrfRes.headers.getSetCookie().map((sc) => sc.split(";")[0]).join("; ");
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: csrfCookie },
    body: new URLSearchParams({
      csrfToken,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      json: "true",
    }),
    redirect: "manual",
  });
  const cookie = loginRes.headers.getSetCookie().map((sc) => sc.split(";")[0]).join("; ");
  if (!cookie) throw new Error(`Login admin fail: status=${loginRes.status}`);

  const checks = [
    { path: "/", contains: "Thư viện Họa Tiết" },
    { path: "/bo-suu-tap", contains: "Bộ sưu tập" },
    { path: "/admin", contains: "Doanh thu 14 ngày qua" },
    { path: "/admin/don-hang", contains: "Đơn hàng" },
    { path: "/admin/san-pham", contains: "Sản phẩm" },
    { path: "/admin/san-pham/moi", contains: "Thêm sản phẩm" },
    { path: "/admin/chuyen-muc", contains: "Chuyên mục" },
    { path: "/admin/chuyen-muc/moi", contains: "Thêm chuyên mục" },
    { path: "/admin/khach-hang", contains: "Khách hàng" },
    { path: "/admin/tai-file", contains: "Lịch sử tải file" },
    ...(aUser ? [{ path: `/admin/khach-hang/${String(aUser._id)}`, contains: "đơn" }] : []),
    ...(paidOrder
      ? [
          { path: `/admin/don-hang/${String(paidOrder._id)}`, contains: "Thu hồi" },
          { path: `/admin/don-hang/${String(paidOrder._id)}`, contains: "Sản phẩm trong đơn" },
        ]
      : []),
  ];

  const results = [];
  for (const c of checks) {
    try {
      const r = await fetch(`${BASE}${c.path}`, { headers: { cookie }, redirect: "manual" });
      const html = r.status === 200 ? await r.text() : "";
      const ok = r.status === 200 && html.includes(c.contains);
      results.push({ path: c.path, ok, status: r.status });
      console.log(`${ok ? "✔" : "✘"} ${c.path} — status=${r.status} contains=${ok}`);
    } catch (e) {
      results.push({ path: c.path, ok: false, status: 0 });
      console.log(`✘ ${c.path} — ${String(e).slice(0, 120)}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\nKẾT QUẢ: ${results.length - failed.length}/${results.length} PASS`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});