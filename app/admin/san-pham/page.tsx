import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Product } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  let products: {
    id: string;
    title: string;
    categoryName: string;
    format: string;
    price: number;
    isActive: boolean;
  }[] = [];
  try {
    await connectDb();
    const docs = await Product.find()
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .lean();
    products = docs.map((p) => {
      const cat = p.category as { name?: string } | null;
      return {
        id: p._id.toString(),
        title: p.title,
        categoryName: cat?.name ?? "—",
        format: p.format,
        price: p.price,
        isActive: p.isActive,
      };
    });
  } catch {
    /* DB chưa kết nối */
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Sản phẩm</h2>
        <Link
          href="/admin/san-pham/moi"
          className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-foreground/50">
          Chưa có sản phẩm nào. Nhấn &quot;Thêm sản phẩm&quot; để bắt đầu.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-foreground/50">
                  {p.categoryName} · {p.format} · {formatVND(p.price)} ·{" "}
                  {p.isActive ? (
                    <span className="text-green-600 dark:text-green-400">hiển thị</span>
                  ) : (
                    <span className="text-accent">ẩn</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/san-pham/${p.id}`}
                  className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                >
                  Sửa
                </Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!confirm(`Xóa sản phẩm "${p.title}"?`)) e.preventDefault();
                    }}
                    className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    Xóa
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}