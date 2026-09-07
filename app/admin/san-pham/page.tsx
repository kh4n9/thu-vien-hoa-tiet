import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Product } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { escapeRegex } from "@/lib/status";
import { Pagination } from "@/components/admin/pagination";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { toggleProductActive } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProducts({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const visible = typeof sp.visible === "string" && sp.visible ? sp.visible : "ALL";
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);

  let products: {
    id: string;
    slug: string;
    title: string;
    categoryName: string;
    format: string;
    price: number;
    isActive: boolean;
    thumb: string | null;
  }[] = [];
  let total = 0;

  try {
    await connectDb();
    const filter: Record<string, unknown> = {};
    if (visible === "HIDDEN") filter.isActive = false;
    if (visible === "ACTIVE") filter.isActive = true;
    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };

    const [list, count] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate("category", "name")
        .lean(),
      Product.countDocuments(filter),
    ]);
    total = count;
    products = (list as unknown as Array<{
      _id: { toString(): string };
      slug: string;
      title: string;
      format: string;
      price: number;
      isActive: boolean;
      imageKeys: string[];
      category: { name?: string } | null;
    }>).map((p) => ({
      id: p._id.toString(),
      slug: p.slug,
      title: p.title,
      categoryName: p.category?.name ?? "—",
      format: p.format,
      price: p.price,
      isActive: p.isActive,
      thumb: p.imageKeys?.[0] ?? null,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = new URLSearchParams();
  if (visible !== "ALL") base.set("visible", visible);
  if (q) base.set("q", q);
  const makeHref = (p: number) => {
    const s = new URLSearchParams(base);
    if (p > 1) s.set("page", String(p));
    else s.delete("page");
    const qs = s.toString();
    return `/admin/san-pham${qs ? `?${qs}` : ""}`;
  };
  const visibleHref = (v: string) => {
    const s = new URLSearchParams();
    if (v !== "ALL") s.set("visible", v);
    if (q) s.set("q", q);
    const qs = s.toString();
    return `/admin/san-pham${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sản phẩm</h2>
          <p className="mt-1 text-sm text-foreground/55">Quản lý file bán ({total}).</p>
        </div>
        <Link
          href="/admin/san-pham/moi"
          className="inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { v: "ALL", label: "Tất cả" },
            { v: "ACTIVE", label: "Đang hiển thị" },
            { v: "HIDDEN", label: "Đã ẩn" },
          ].map((t) => (
            <Link
              key={t.v}
              href={visibleHref(t.v)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                visible === t.v
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface hover:border-accent hover:text-accent"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <form method="get" className="flex gap-2">
          {visible !== "ALL" && <input type="hidden" name="visible" value={visible} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo tên…"
            className="h-10 w-full max-w-xs rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="h-10 rounded-full bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Tìm
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-foreground/50">
          Không có sản phẩm nào. Nhấn &quot;Thêm sản phẩm&quot; để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground/45">
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Chuyên mục</th>
                <th className="px-4 py-3 font-medium">Định dạng</th>
                <th className="px-4 py-3 font-medium">Giá</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-background">
                        {p.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/media/${p.thumb}`} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-foreground/35">
                            {p.format}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/san-pham/${p.id}`} className="line-clamp-1 font-medium hover:text-accent">
                          {p.title}
                        </Link>
                        <p className="font-mono text-[11px] text-foreground/45">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-medium">{p.format}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">{formatVND(p.price)}</td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <span className="rounded-full bg-green-600/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                        Hiển thị
                      </span>
                    ) : (
                      <span className="rounded-full bg-line px-2.5 py-0.5 text-xs text-foreground/50">Ẩn</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                        >
                          {p.isActive ? "Ẩn" : "Hiện"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/san-pham/${p.id}`}
                        className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
                      >
                        Sửa
                      </Link>
                      <DeleteProductButton id={p.id} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}