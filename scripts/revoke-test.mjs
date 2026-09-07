// Test chức năng thu hồi sản phẩm trong đơn: tải được → thu hồi → 403 → hủy thu hồi → tải lại được.
import fs from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) throw new Error("Thiếu ADMIN_EMAIL/ADMIN_PASSWORD");
const BASE = "http://127.0.0.1:3000";

async function main() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  // Đồng bộ mật khẩu admin với .env để chắc chắn login được
  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await mongoose.connection.db
    .collection("users")
    .updateOne({ email: env.ADMIN_EMAIL }, { $set: { passwordHash: hash, role: "ADMIN" } });

  // Đăng nhập admin qua API auth
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = csrfRes.headers
    .getSetCookie()
    .map((sc) => sc.split(";")[0])
    .join("; ");
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: csrfCookie,
    },
    body: new URLSearchParams({
      csrfToken,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      json: "true",
    }),
    redirect: "manual",
  });
  const setCookies = loginRes.headers.getSetCookie();
  const cookie = setCookies.map((sc) => sc.split(";")[0]).join("; ");
  if (!cookie) {
    const body = await loginRes.text().catch(() => "");
    throw new Error(
      `Login admin fail — status=${loginRes.status}, location=${loginRes.headers.get("location")}, body=${body.slice(0, 120)}`,
    );
  }

  // Tìm 1 đơn PAID có sản phẩm
  const paid = await mongoose.connection.db
    .collection("orders")
    .findOne({ status: "PAID", items: { $exists: true, $ne: [] } }, { sort: { createdAt: -1 } });
  if (!paid) {
    console.log("✘ Không có đơn PAID nào để test — bỏ qua.");
    process.exit(0);
  }
  const [orderId, productId] = [String(paid._id), String(paid.items[0].product)];
  console.log(`Đơn test: ${paid.code} (order=${orderId}, product=${productId})`);

  async function download() {
    const r = await fetch(`${BASE}/api/download/${orderId}/${productId}`, {
      headers: { cookie },
      redirect: "manual",
    });
    return { status: r.status, body: (await r.text()).slice(0, 120) };
  }

  async function toggleRevoke(revoked) {
    await mongoose.connection.db.collection("orders").updateOne(
      { _id: paid._id, "items._id": paid.items[0]._id },
      { $set: { "items.$.revoked": revoked } },
    );
  }

  const step = (k, ok, extra = "") =>
    console.log(`${ok ? "✔" : "✘"} ${k}${extra ? " — " + extra : ""}`);

  // 1. Chưa thu hồi → tải được (307 redirect sang R2)
  await toggleRevoke(false);
  let r1 = await download();
  step("Tải khi chưa thu hồi → 307", r1.status === 307, `status=${r1.status}`);

  // 2. Thu hồi → 403
  await toggleRevoke(true);
  let r2 = await download();
  step("Tải khi đã thu hồi → 403", r2.status === 403, `status=${r2.status} body=${r2.body}`);

  // 3. Hủy thu hồi → tải lại được
  await toggleRevoke(false);
  let r3 = await download();
  step("Tải sau khi hủy thu hồi → 307", r3.status === 307, `status=${r3.status}`);

  // Dọn: trả về trạng thái ban đầu
  await toggleRevoke(false);

  const pass = r1.status === 307 && r2.status === 403 && r3.status === 307;
  console.log(`\nKẾT QUẢ: ${pass ? "PASS" : "FAIL"}`);
  await mongoose.disconnect();
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});