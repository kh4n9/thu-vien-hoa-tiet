import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Order, Product } from "@/lib/models";
import { formatVND } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let productCount = 0;
  let activeCount = 0;
  let orderCount = 0;
  let revenue = 0;
  let pendingOrders = 0;

  try {
    await connectDb();
    const [pc, ac, oc, revAgg, po] = await Promise.all([
      Product.countDocuments().catch(() => 0),
      Product.countDocuments({ isActive: true }).catch(() => 0),
      Order.countDocuments().catch(() => 0),
      Order.aggregate([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]).catch(() => [] as { total: number }[]),
      Order.countDocuments({ status: "PENDING" }).catch(() => 0),
    ]);
    productCount = pc;
    activeCount = ac;
    orderCount = oc;
    revenue = revAgg[0]?.total ?? 0;
    pendingOrders = po;
  } catch {
    /* DB chưa kết nối */
  }

  const stats = [
    { label: "Sản phẩm", value: productCount, href: "/admin/san-pham" },
    { label: "Đang hiển thị", value: activeCount },
    { label: "Đơn hàng", value: orderCount, href: "/admin/don-hang" },
    { label: "Đơn chờ thanh toán", value: pendingOrders },
    { label: "Doanh thu đã thu", value: formatVND(revenue) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => {
        const inner = (
          <>
            <p className="text-sm text-foreground/50">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
          </>
        );
        return s.href ? (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            {inner}
          </Link>
        ) : (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-5">
            {inner}
          </div>
        );
      })}
    </div>
  );
}