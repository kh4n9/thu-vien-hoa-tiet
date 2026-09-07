// Kiểm tra kết nối MongoDB (đọc MONGODB_URI từ .env).
// Chạy: node --env-file=.env scripts/dbcheck.mjs
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Thiếu MONGODB_URI trong .env");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15_000 });
  const db = mongoose.connection.db;
  const ping = await db.command({ ping: 1 });
  const cols = await db.listCollections().toArray();
  console.log("Kết nối MongoDB OK — database:", db.databaseName);
  console.log("Ping:", ping.ok === 1 ? "ok" : "fail");
  console.log("Collections:", cols.map((c) => c.name).join(", ") || "(trống)");
} catch (e) {
  console.error("Kết nối thất bại:", e.message);
  process.exit(1);
} finally {
  await mongoose.disconnect().catch(() => null);
}