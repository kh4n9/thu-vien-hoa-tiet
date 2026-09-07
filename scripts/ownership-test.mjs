// Kiểm tra query "đã mua" dùng trên trang sản phẩm (cùng điều kiện với page.tsx).
import fs from "node:fs";
import mongoose from "mongoose";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      let v = l.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      return [l.slice(0, i).trim(), v];
    }),
);

async function main() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;

  const paid = await db
    .collection("orders")
    .findOne({ status: "PAID", items: { $exists: true, $ne: [] } }, { sort: { paidAt: -1 } });
  if (!paid) {
    console.log("Không có đơn PAID — skip.");
    process.exit(0);
  }
  const ownerId = paid.user;
  const productId = paid.items[0].product;

  const owned = await db.collection("orders").findOne(
    {
      user: ownerId,
      status: "PAID",
      items: { $elemMatch: { product: new mongoose.Types.ObjectId(String(productId)), revoked: { $ne: true } } },
    },
    { sort: { paidAt: -1 } },
  );
  console.log(`Đơn test: ${paid.code} | owner=${String(ownerId)} | product=${String(productId)}`);
  console.log(owned ? `✔ Query "đã mua" tìm thấy đơn: ${owned.code}` : "✘ Query không tìm thấy (sai)");

  await mongoose.disconnect();
  process.exit(owned ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});