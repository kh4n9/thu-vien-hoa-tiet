import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Order, type OrderItemBase, type ObjectId, type ProductDoc } from "@/lib/models";
import { formatVND, formatBytes } from "@/lib/utils";
import { escapeRegex } from "@/lib/status";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type LibItem = {
  id: string;
  productId: string;
  slug: string;
  title: string;
  format: string;
  fileSize: number;
  imageKeys: string[];
  categorySlug: string;
  categoryName: string;
  revoked: boolean;
  productMissing: boolean;
};

export default async function ThuVienPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?next=/thu-vien");

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = typeof sp.cat === "string" && sp.cat ? sp.cat : "ALL";

  let orders: { id: string; code: string; paidAt: Date | null; total: number; items: LibItem[] }[] = [];
  try {
    await connectDb();
    const docs = await Order.find({ user: session.user.id, status: "PAID" })
      .sort({ paidAt: -1 })
      .populate({
        path: "items.product",
        select: "slug title format fileSize imageKeys category",
        populate: { path: "category", select: "slug name" },
      })
      .lean();

    orders = docs.map((order) => ({
      id: order._id.toString(),
      code: order.code,
      paidAt: order.paidAt,
      total: order.total,
      items: order.items.map((item: OrderItemBase & { _id: ObjectId }) => {
        const p = item.product as unknown as
          | (ProductDoc & { category?: { slug?: string; name?: string } | null })
          | null;
        return {
          id: String(item._id),
          productId: p ? p._id.toString() : String(item.product),
          slug: p?.slug ?? "",
          title: p?.title ?? item.title,
          format: p?.format ?? "",
          fileSize: p?.fileSize ?? 0,
          imageKeys: p?.imageKeys ?? [],
          categorySlug: p?.category?.slug ?? "",
          categoryName: p?.category?.name ?? "",
          revoked: !!item.revoked,
          productMissing: !p,
        };
      }),
    }));
  } catch {
    /* DB chưa kết nối */
  }

  // Danh sách chuyên mục có trong thư viện của khách
  const categoryOptions: { slug: string; name: string }[] = [];
  for (const o of orders) {
    for (const it of o.items) {
      if (it.categorySlug && !categoryOptions.some((c) => c.slug === it.categorySlug)) {
        categoryOptions.push({ slug: it.categorySlug, name: it.categoryName || it.categorySlug });
      }
    }
  }
  categoryOptions.sort((a, b) => a.name.localeCompare(b.name, "vi"));

  const qRe = q ? new RegExp(escapeRegex(q), "i") : null;
  const filteredOrders = orders
    .map((order) => ({
      ...order,
      items: order.items.filter((it) => {
        if (qRe && !qRe.test(it.title)) return false;
        if (cat !== "ALL" && it.categorySlug !== cat) return false;
        return true;
      }),
    }))
    .filter((order) => order.items.length > 0);

  const resultCount = filteredOrders.reduce((s, o) => s + o.items.length, 0);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">Thư viện của tôi</h1>
      <p className="mt-1 text-foreground/60">
        Các file bạn đã mua và thanh toán thành công. Tải về bất cứ lúc nào.
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="font-semibold">Bạn chưa có file nào</p>
          <p className="mt-1 text-foreground/50">
            Sau khi mua và thanh toán, file sẽ xuất hiện ở đây.
          </p>
          <Link
            href="/bo-suu-tap"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Khám phá bộ sưu tập
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Tìm kiếm + bộ lọc */}
          <form method="get" className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm theo tên file…"
              className="h-11 w-full rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
            />
            <select
              name="cat"
              defaultValue={cat}
              className="h-11 w-full rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent sm:w-56"
            >
              <option value="ALL">Tất cả chuyên mục</option>
              {categoryOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Lọc
            </button>
            {(q || cat !== "ALL") && (
              <Link
                href="/thu-vien"
                className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm text-foreground/60 transition-colors hover:text-accent"
              >
                Bỏ lọc
              </Link>
            )}
          </form>

          {resultCount === 0 ? (
            <p className="rounded-2xl border border-line bg-surface p-10 text-center text-foreground/50">
              Không có file nào khớp với bộ lọc.
            </p>
          ) : (
            <>
              <p className="text-sm text-foreground/50">{resultCount} file phù hợp.</p>
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{order.code}</p>
                      <p className="text-xs text-foreground/50">
                        Thanh toán: {order.paidAt ? formatDate(order.paidAt) : "—"}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {formatVND(order.total)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 rounded-xl p-2 ${
                          item.revoked ? "bg-accent/[0.05]" : ""
                        }`}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background">
                          {item.imageKeys[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/media/${item.imageKeys[0]}`}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-foreground/40">
                              {item.format || "—"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-medium">{item.title}</p>
                          <p className="truncate text-xs text-foreground/50">
                            {[
                              item.categoryName || null,
                              item.format ? `${item.format} · ${formatBytes(item.fileSize)}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {item.revoked && (
                            <p className="mt-0.5 text-xs font-semibold text-accent">
                              Đã bị thu hồi — liên hệ admin để được hỗ trợ.
                            </p>
                          )}
                        </div>
                        {!item.productMissing && !item.revoked && (
                          <a
                            href={`/api/download/${order.id}/${item.productId}`}
                            className="inline-flex h-9 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
                          >
                            Tải file
                          </a>
                        )}
                        {item.revoked && (
                          <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                            Thu hồi
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}