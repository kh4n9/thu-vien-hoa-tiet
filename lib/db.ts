import mongoose from "mongoose";

// MongoDB Atlas (hoặc local) — mongoose thuần JS nên chạy tốt trên mọi nền tảng.
const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error(
    "Thiếu MONGODB_URI trong .env — tạo cluster miễn phí tại https://www.mongodb.com/atlas rồi dán connection string vào.",
  );
}

// Singleton kết nối — tránh mở nhiều connection khi HMR (dev) / nhiều request.
declare global {
  var __mongo: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = (globalThis.__mongo ??= { conn: null, promise: null });

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null; // cho phép retry lần sau
    throw e;
  }
}