import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  let categories: { id: string; name: string; slug: string; description: string | null; order: number; count: number }[] = [];
  try {
    await connectDb();
    const [docs, counts] = await Promise.all([
      Category.find().sort({ order: 1, name: 1 }).lean(),
      Product.aggregate([
        { $group: { _id: "$category", n: { $sum: 1 } } },
      ]),
    ]);
    const countMap = new Map(
      (counts as { _id: { toString(): string }; n: number }[]).map((c) => [c._id.toString(), c.n]),
    );
    categories = (docs as unknown as Array<{
      _id: { toString(): string };
      name: string;
      slug: string;
      description: string | null;
      order: number;
    }>).map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      order: c.order,
      count: countMap.get(c._id.toString()) ?? 0,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Chuyên mục</h2>
          <p className="mt-1 text-sm text-foreground/55">
            Nhóm sản phẩm hiển thị trên trang chủ và bộ sưu tập ({categories.length}).
          </p>
        </div>
        <Link
          href="/admin/chuyen-muc/moi"
          className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          + Thêm chuyên mục
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-foreground/50">
          Chưa có chuyên mục nào. Nhấn &quot;Thêm chuyên mục&quot; để tạo.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-line/60 text-xs font-bold text-foreground/60">
                      {c.order + 1}
                    </span>
                    <p className="truncate font-semibold">{c.name}</p>
                    {c.count > 0 ? (
                      <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        {c.count} SP
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-line px-2 py-0.5 text-xs text-foreground/50">
                        trống
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-foreground/45">/{c.slug}</p>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{c.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/chuyen-muc/${c.id}`}
                    className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                  >
                    Sửa
                  </Link>
                  <CategoryDeleteButton id={c.id} name={c.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}