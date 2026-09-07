import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Order, User, toObjectId } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { statusBadge, fmtDateTime } from "@/lib/status";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function CustomerOrdersPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const userId = toObjectId(id);

  let customer: { id: string; email: string; name: string | null } | null = null;
  let orders: {
    id: string;
    code: string;
    status: string;
    total: number;
    itemCount: number;
    createdAt: Date;
    paidAt: Date | null;
  }[] = [];

  try {
    await connectDb();
    const user = userId
      ? await User.findById(userId).select({ email: 1, name: 1 }).lean()
      : null;
    if (!user) notFound();
    const u = user as unknown as { _id: { toString(): string }; email: string; name: string | null };
    customer = { id: u._id.toString(), email: u.email, name: u.name };

    const docs = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    orders = (docs as unknown as Array<{
      _id: { toString(): string };
      code: string;
      status: string;
      total: number;
      items: unknown[];
      createdAt: Date;
      paidAt: Date | null;
    }>).map((o) => ({
      id: o._id.toString(),
      code: o.code,
      status: o.status,
      total: o.total,
      itemCount: o.items.length,
      createdAt: o.createdAt,
      paidAt: o.paidAt ?? null,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  if (!customer) notFound();

  const paidTotal = orders
    .filter((o) => o.status === "PAID")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-5">
      <Link href="/admin/khach-hang" className="text-sm text-foreground/55 hover:text-accent">
        ← Tất cả khách hàng
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {customer.name ?? "Khách hàng ẩn danh"}
          </h2>
          <p className="mt-1 break-all text-sm text-foreground/55">{customer.email}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground/55">
            {orders.length} đơn · <b className="text-foreground">{formatVND(paidTotal)}</b> đã chi
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground/45">
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 text-center font-medium">SL</th>
              <th className="px-4 py-3 font-medium">Tổng</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Tạo lúc</th>
              <th className="px-4 py-3 font-medium">Thanh toán</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-foreground/45">
                  Khách hàng này chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const badge = statusBadge(o.status);
                return (
                  <tr key={o.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 font-semibold">{o.code}</td>
                    <td className="px-4 py-3 text-center text-foreground/60">{o.itemCount}</td>
                    <td className="px-4 py-3 font-bold">{formatVND(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/55">{fmtDateTime(o.createdAt)}</td>
                    <td className="px-4 py-3 text-foreground/55">{fmtDateTime(o.paidAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/don-hang/${o.id}`}
                        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}