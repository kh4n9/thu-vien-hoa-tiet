import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { toCardProduct, type ProductForCard } from "@/lib/card";
import { ProductCard } from "@/components/product-card";
import { Motif, MotifDivider } from "@/components/motif";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories: { name: string; slug: string }[] = [];
  let products: ProductForCard[] = [];

  try {
    await connectDb();
    const catDocs = await Category.find().sort({ order: 1 }).lean();
    categories = catDocs.map((c) => ({ name: c.name, slug: c.slug }));

    const prodDocs = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name slug")
      .lean();
    products = prodDocs.map(toCardProduct);
  } catch {
    // Database chưa kết nối — trang vẫn hiển thị với trạng thái trống.
  }

  return (
    <>
      {/* ===== Hero — sơn mài & vàng lá ===== */}
      <section className="texture-lacquer relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--lacquer-vignette)_100%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Motif className="h-14 w-14 opacity-90" strokeWidth={1.1} />
          </div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-gold">
            Họa tiết cổ truyền Á Đông · Sẵn sàng cho sản xuất
          </p>
          <h1 className="font-display text-[42px] font-medium leading-[1.05] tracking-tight text-lacquer-fg sm:text-6xl">
            Bản vẽ kỹ thuật <em className="text-gold">họa tiết</em>
            <br className="hidden sm:block" /> cho CNC, khắc gỗ & laser
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-lacquer-soft sm:text-lg">
            Hoa sen, trống đồng, sóng nước — những mẫu bản vẽ DXF, AI, PDF đã sẵn dấu khắc, mở là
            dùng ngay cho xưởng sản xuất và mỹ nghệ.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/bo-suu-tap"
              className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-accent-strong"
            >
              Khám phá bộ sưu tập
            </Link>
            <Link
              href="/huong-dan"
              className="inline-flex h-12 items-center rounded-full border border-lacquer-fg/50 px-8 text-base font-medium text-lacquer-fg transition-colors hover:bg-lacquer-soft/15"
            >
              Cách dùng file
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Chuyên mục ===== */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-foreground">Chuyên mục</h2>
            <Link href="/bo-suu-tap" className="text-sm font-medium text-accent hover:underline">
              Tất cả →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/bo-suu-tap?category=${c.slug}`}
                className="group rounded-full border border-line bg-surface px-5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-gold hover:text-gold"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Sản phẩm nổi bật ===== */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Bộ sưu tập</p>
          <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Họa tiết nổi bật
          </h2>
          <MotifDivider className="mx-auto mt-5 max-w-xs" />
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-foreground/50">
            Bộ sưu tập đang được bổ sung. Quay lại sau nhé.
          </p>
        )}
      </section>

      {/* ===== Cách hoạt động ===== */}
      <section className="texture-lacquer border-t border-lacquer-line/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-medium text-lacquer-fg">Cách mua & tải</h2>
            <MotifDivider className="mx-auto mt-5 max-w-xs" />
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { t: "Chọn họa tiết", d: "Duyệt theo chuyên mục, xem thông số và ảnh xem trước từng bản vẽ." },
              { t: "Thanh toán", d: "Thanh toán trực tuyến an toàn qua cổng VNPay." },
              { t: "Tải ngay", d: "File xuất hiện trong Thư viện của bạn — tải về bất cứ lúc nào." },
            ].map((f, i) => (
              <div key={f.t} className="flex gap-4">
                <span className="font-display text-4xl font-light text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg text-lacquer-fg">{f.t}</h3>
                  <p className="text-sm leading-relaxed text-lacquer-soft">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}