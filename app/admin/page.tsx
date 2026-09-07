import Link from "next/link";
import { connectDb } from "@/lib/db";
import { DownloadRecord, Order, Product, User } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { statusBadge, fmtDateTime } from "@/lib/status";

export const dynamic = "force-dynamic";

const TZ = "Asia/Ho_Chi_Minh";

type Stat = { label: string; value: string | number; accent?: boolean };

function StatCard({ label, value, accent }: Stat) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">{label}</p>
      <p className={`mt-1.5 text-2xl font-extrabold ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}

function RevenueBars({ days }: { days: { key: string; label: string; total: number; isToday: boolean }[] }) {
  const max = Math.max(...days.map((d) => d.total), 1);
  return (
    <div className="flex h-36 items-end gap-1.5">
      {days.map((d) => (
        <div
          key={d.key}
          className="group flex flex-1 flex-col items-center gap-1"
          title={`${d.label}: ${formatVND(d.total)}`}
        >
          <div className="relative w-full flex-1 rounded-t-md bg-line/40">
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all ${
                d.isToday ? "bg-accent" : "bg-gold/70"
              }`}
              style={{ height: `${Math.max((d.total / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground/45">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboard() {
  let revenue = 0;
  let orderCount = 0;
  let pendingCount = 0;
  let productCount = 0;
  let activeCount = 0;
  let userCount = 0;
  let dlCount = 0;
  let statuses: { _id: string; n: number }[] = [];
  let dayAgg: { _id: string; total: number }[] = [];
  let topProducts: { title: string; count: number; revenue: number }[] = [];
  let recentOrders: {
    id: string;
    code: string;
    userLabel: string;
    total: number;
    status: string;
    createdAt: Date;
  }[] = [];

  try {
    await connectDb();
    const docs = await Promise.all([
      Order.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ status: "PENDING" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      DownloadRecord.countDocuments(),
      Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: "PAID", paidAt: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: TZ } },
            total: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: "PAID" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            title: { $first: "$items.title" },
            count: { $sum: 1 },
            revenue: { $sum: "$items.price" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("user", "email name")
        .lean(),
    ]);

    revenue = (docs[0][0] as { total?: number } | undefined)?.total ?? 0;
    orderCount = docs[1];
    pendingCount = docs[2];
    productCount = docs[3];
    activeCount = docs[4];
    userCount = docs[5];
    dlCount = docs[6];
    statuses = docs[7] as { _id: string; n: number }[];
    dayAgg = docs[8] as { _id: string; total: number }[];
    topProducts = docs[9] as { title: string; count: number; revenue: number }[];
    recentOrders = (docs[10] as Array<{
      _id: { toString(): string };
      code: string;
      total: number;
      status: string;
      createdAt: Date;
      user: { email?: string; name?: string | null } | null;
    }>).map((o) => ({
      id: o._id.toString(),
      code: o.code,
      userLabel: o.user?.name ?? o.user?.email ?? "—",
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  // 14 ngày gần nhất
  const dayMap = new Map(dayAgg.map((d) => [d._id, d.total]));
  const today = new Date();
  const days: { key: string; label: string; total: number; isToday: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    days.push({
      key,
      label: new Intl.DateTimeFormat("vi-VN", { weekday: "short", timeZone: TZ }).format(d),
      total: dayMap.get(key) ?? 0,
      isToday: i === 0,
    });
  }

  const statusTotal = Math.max(statuses.reduce((s, x) => s + x.n, 0), 1);
  const maxTopRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Tổng quan</h2>
        <p className="mt-1 text-sm text-foreground/55">
          Tình hình kinh doanh gần đây của thư viện.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Doanh thu đã thu" value={formatVND(revenue)} accent />
        <StatCard label="Đơn hàng" value={orderCount} />
        <StatCard label="Đơn chờ xử lý" value={pendingCount} />
        <StatCard label="Sản phẩm" value={productCount} />
        <StatCard label="Sản phẩm hiển thị" value={activeCount} />
        <StatCard label="Khách hàng" value={userCount} />
        <StatCard label="Lượt tải file" value={dlCount} />
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">Tỷ lệ hiển thị</p>
          <p className="mt-1.5 text-2xl font-extrabold">
            {productCount > 0 ? Math.round((activeCount / productCount) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Doanh thu 14 ngày */}
        <section className="rounded-2xl border border-line bg-surface p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Doanh thu 14 ngày qua</h3>
            <span className="text-sm font-bold text-accent">
              {formatVND(days.reduce((s, d) => s + d.total, 0))}
            </span>
          </div>
          <RevenueBars days={days} />
        </section>

        {/* Tình trạng đơn hàng */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-4 font-semibold">Tình trạng đơn hàng</h3>
          <div className="space-y-3">
            {["PAID", "PENDING", "CANCELLED", "FAILED", "REFUNDED"].map((s) => {
              const count = statuses.find((x) => x._id === s)?.n ?? 0;
              const badge = statusBadge(s);
              return (
                <div key={s}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
                      {badge.text}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-accent/80"
                      style={{ width: `${(count / statusTotal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Top sản phẩm */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-4 font-semibold">Sản phẩm bán chạy nhất</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3.5">
              {topProducts.map((p, i) => (
                <div key={p.title}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">
                      <span className="mr-1.5 text-foreground/40">#{i + 1}</span>
                      {p.title}
                    </span>
                    <span className="shrink-0 text-foreground/60">
                      {p.count}x · <b className="text-foreground">{formatVND(p.revenue)}</b>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-gold/80"
                      style={{ width: `${(p.revenue / maxTopRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-foreground/45">
              Chưa có đơn hàng đã thanh toán.
            </p>
          )}
        </section>

        {/* Đơn hàng gần nhất */}
        <section className="rounded-2xl border border-line bg-surface p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Đơn hàng gần nhất</h3>
            <Link href="/admin/don-hang" className="text-sm font-medium text-accent hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground/45">
                  <th className="py-2 pr-3 font-medium">Mã đơn</th>
                  <th className="py-2 pr-3 font-medium">Khách hàng</th>
                  <th className="py-2 pr-3 font-medium">Tổng</th>
                  <th className="py-2 pr-3 font-medium">Trạng thái</th>
                  <th className="py-2 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-foreground/45">
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => {
                    const badge = statusBadge(o.status);
                    return (
                      <tr key={o.id} className="border-b border-line/60 last:border-0">
                        <td className="py-2.5 pr-3">
                          <Link
                            href={`/admin/don-hang/${o.id}`}
                            className="font-semibold text-accent hover:underline"
                          >
                            {o.code}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-foreground/70">{o.userLabel}</td>
                        <td className="py-2.5 pr-3 font-bold">{formatVND(o.total)}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="py-2.5 text-foreground/55">{fmtDateTime(o.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}