import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, activeCount, orderCount, revenueAgg, pendingOrders] = await Promise.all([
    prisma.product.count().catch(() => 0),
    prisma.product.count({ where: { isActive: true } }).catch(() => 0),
    prisma.order.count().catch(() => 0),
    prisma.order
      .aggregate({ where: { status: "PAID" }, _sum: { total: true } })
      .catch(() => ({ _sum: { total: null } })),
    prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
  ]);

  const stats = [
    { label: "Sản phẩm", value: productCount, href: "/admin/san-pham" },
    { label: "Đang hiển thị", value: activeCount },
    { label: "Đơn hàng", value: orderCount, href: "/admin/don-hang" },
    { label: "Đơn chờ thanh toán", value: pendingOrders },
    { label: "Doanh thu đã thu", value: formatVND(revenueAgg._sum.total ?? 0) },
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