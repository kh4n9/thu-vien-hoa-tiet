import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "Chờ thanh toán", cls: "bg-gold/15 text-gold" },
  PAID: { text: "Đã thanh toán", cls: "bg-green-600/10 text-green-600 dark:text-green-400" },
  FAILED: { text: "Thất bại", cls: "bg-accent/10 text-accent" },
  CANCELLED: { text: "Đã hủy", cls: "bg-line text-foreground/50" },
  REFUNDED: { text: "Hoàn tiền", cls: "bg-line text-foreground/50" },
};

export default async function AdminOrders() {
  const orders = await prisma.order
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } }, items: true },
    })
    .catch(() => []);

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">Đơn hàng</h2>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-foreground/50">
          Chưa có đơn hàng nào.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusLabel[order.status] ?? statusLabel.PENDING;
            return (
              <div key={order.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{order.code}</p>
                    <p className="text-xs text-foreground/50">
                      {order.user.name ?? order.user.email} ·{" "}
                      {new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.cls}`}>
                      {status.text}
                    </span>
                    <span className="font-bold">{formatVND(order.total)}</span>
                  </div>
                </div>
                {order.items.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-foreground/60">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4">
                        <span className="line-clamp-1">{item.title}</span>
                        <span className="shrink-0">{formatVND(item.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}