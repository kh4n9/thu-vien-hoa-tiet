// Seed cơ sở dữ liệu MongoDB: chuyên mục + tài khoản admin + sản phẩm mẫu.
// Chạy: npm run db:seed  (cần MONGODB_URI trong .env)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Category, Product } from "../lib/models.ts";

const categories = [
  { name: "Hoa sen", slug: "hoa-sen", description: "Hoa sen trong nghệ thuật Phật giáo và trang trí truyền thống." },
  { name: "Trống đồng", slug: "trong-dong", description: "Hoa văn trống đồng Đông Sơn: chim, sóng nước, mặt trời." },
  { name: "Sóng nước", slug: "song-nuoc", description: "Các dạng sóng nước, mây cuộn, lửa thiêng." },
  { name: "Chữ & biểu tượng", slug: "chu-bieu-tuong", description: "Chữ Hán/Nôm, biểu tượng tứ linh, phù điêu." },
  { name: "Mỹ nghệ & nội thất", slug: "my-nghe-noi-that", description: "Họa tiết cho nội thất, khắc gỗ, CNC, laser." },
];

const sampleProducts = [
  { slug: "hoa-sen-cach-dieu-cnc", title: "Hoa sen cách điệu — bản khắc CNC", category: "hoa-sen", price: 150000, format: "DXF", description: "Bản vẽ hoa sen cách điệu theo phong cách Đông Á, chi tiết cánh và gân lá rõ ràng, sẵn sàng cho khắc CNC và laser." },
  { slug: "lotus-medallion-my-nghe", title: "Lotus medallion — huy hiệu mỹ nghệ", category: "hoa-sen", price: 120000, format: "AI", description: "Họa tiết sen dạng medallion tròn, đối xứng hoàn hảo, dùng cho thêu, in và chạm khắc nội thất." },
  { slug: "trong-dong-mat-troi", title: "Trống đồng Đông Sơn — hoa văn mặt trời", category: "trong-dong", price: 180000, format: "DXF", description: "Tái hiện hoa văn mặt trời và vòng sóng nước trên trống đồng, bản vẽ kỹ thuật tỉ mỉ cho khắc gỗ và đúc." },
  { slug: "chim-lac-song-nuoc", title: "Chim Lạc & sóng nước", category: "trong-dong", price: 160000, format: "PDF", description: "Cặp chim Lạc lướt trên dải sóng nước cách điệu, phù hợp khắc panel trang trí và nội thất." },
  { slug: "song-nuoc-cuon-may", title: "Sóng nước cuộn mây", category: "song-nuoc", price: 130000, format: "AI", description: "Đường cong sóng nước xen mây cuộn, mềm mại và uyển chuyển, dùng cho đường diềm và viền trang trí." },
  { slug: "lua-thieng-may-mua", title: "Lửa thiêng & mây mùa", category: "song-nuoc", price: 140000, format: "DXF", description: "Họa tiết lửa thiêng kết hợp mây mùa truyền thống, tạo điểm nhấn cho lan can và cổng." },
  { slug: "tu-linh-long-lan", title: "Tứ linh — Long Lân Quy Phụng", category: "chu-bieu-tuong", price: 200000, format: "DXF", description: "Bộ bốn linh vật Long, Lân, Quy, Phụng cách điệu, bản vẽ chi tiết cho phù điêu và khắc lớn." },
  { slug: "phu-dieu-hoa-van-noi-that", title: "Phù điêu hoa văn nội thất", category: "my-nghe-noi-that", price: 220000, format: "DWG", description: "Panel phù điêu hoa văn cổ truyền cho vách nội thất, tủ, và khung tranh — bản DWG đầy đủ lớp." },
];

const sampleSpecs = [
  { "Kích thước": "600 × 600 mm", "Độ phân giải": "Vector", "Ứng dụng": "CNC, Laser" },
  { "Kích thước": "300 × 300 mm", "Định dạng": "Vector AI", "Ứng dụng": "Thêu, In" },
  { "Kích thước": "800 × 800 mm", "Độ phân giải": "Vector", "Ứng dụng": "Khắc gỗ, Đúc" },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Thiếu MONGODB_URI trong .env — dán connection string của MongoDB Atlas.");
  }

  await mongoose.connect(uri);
  console.log("Đã kết nối MongoDB.");

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@thuvienhoatiet.vn").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "doi-mat-khau-nay";

  for (const [i, c] of categories.entries()) {
    await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, description: c.description, order: i } },
      { upsert: true, returnDocument: "after" },
    );
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    await User.updateOne({ _id: existingAdmin._id }, { $set: { role: "ADMIN" } });
    console.log(`Admin đã tồn tại — chỉ cập nhật role ADMIN: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({ email: adminEmail, name: "Quản trị viên", passwordHash, role: "ADMIN" });
    console.log(`Tạo admin mới: ${adminEmail}`);
  }

  const catBySlug = new Map(
    (await Category.find().lean()).map((c) => [c.slug, c._id]),
  );

  for (const [i, p] of sampleProducts.entries()) {
    const categoryId = catBySlug.get(p.category);
    if (!categoryId) continue;

    const existing = await Product.findOne({ slug: p.slug });
    const data = {
      slug: p.slug,
      title: p.title,
      description: p.description,
      price: p.price,
      format: p.format,
      category: categoryId,
      isActive: true,
    };
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: data });
    } else {
      const format = p.format.toLowerCase();
      await Product.create({
        ...data,
        fileKey: `products/${p.slug}/mau-thu-vien.${format}`,
        fileName: `mau-${p.slug}.${format}`,
        fileSize: 0,
        fileExt: p.format,
        imageKeys: [],
        specs: sampleSpecs[i % sampleSpecs.length],
        license: "Giấy phép sử dụng thương mại — xem trang Giấy phép.",
      });
    }
  }

  console.log("Seed xong: categories + admin + sample products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => null);
    process.exit(process.exitCode ?? 0);
  });