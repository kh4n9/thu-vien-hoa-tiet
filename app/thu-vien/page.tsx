import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Order, type OrderItemBase, type ObjectId, type ProductDoc } from "@/lib/models";
import { formatVND, formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

type LibItem = {
  id: string;
  productId: string;
  slug: string;
  title: string;
  format: string;
  fileSize: number;
  imageKeys: string[];
  productMissing: boolean;
};

export default async function ThuVienPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?next=/thu-vien");

  let orders: { id: string; code: string; paidAt: Date | null; total: number; items: LibItem[] }[] = [];
  try {
    await connectDb();
    const docs = await Order.find({ user: session.user.id, status: "PAID" })
      .sort({ paidAt: -1 })
      .populate({ path: "items.product", select: "slug title format fileSize imageKeys" })
      .lean();

    orders = docs.map((order) => ({
      id: order._id.toString(),
      code: order.code,
      paidAt: order.paidAt,
      total: order.total,
      items: order.items.map((item: OrderItemBase & { _id: ObjectId }) => {
        const p = item.product as unknown as ProductDoc | null;
        return {
          id: String(item._id),
          productId: p ? p._id.toString() : String(item.product),
          slug: p?.slug ?? "",
          title: p?.title ?? item.title,
          format: p?.format ?? "",
          fileSize: p?.fileSize ?? 0,
          imageKeys: p?.imageKeys ?? [],
          productMissing: !p,
        };
      }),
    }));
  } catch {
    /* DB chưa kết nối */
  }

  const allItems = orders.flatMap((o) => o.items);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">Thư viện của tôi</h1>
      <p className="mt-1 text-foreground/60">
        Các file bạn đã mua và thanh toán thành công. Tải về bất cứ lúc nào.
      </p>

      {allItems.length === 0 ? (
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
          {orders.map((order) => (
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
                  <div key={item.id} className="flex items-center gap-4">
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
                      <p className="text-xs text-foreground/50">
                        {item.format ? `${item.format} · ${formatBytes(item.fileSize)}` : ""}
                      </p>
                    </div>
                    {!item.productMissing && (
                      <a
                        href={`/api/download/${order.id}/${item.productId}`}
                        className="inline-flex h-9 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
                      >
                        Tải file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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