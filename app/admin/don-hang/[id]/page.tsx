import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Order, toObjectId } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { statusBadge, fmtDateTime } from "@/lib/status";
import { updateOrderStatus, toggleOrderItemRevoked } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type Params = { id: string };

const TRANSITION_BUTTONS: Record<string, { status: string; label: string; cls: string }[]> = {
  PENDING: [
    { status: "PAID", label: "Đánh dấu đã thanh toán", cls: "bg-green-600/10 text-green-600 dark:text-green-400" },
    { status: "CANCELLED", label: "Hủy đơn", cls: "bg-line text-foreground/60" },
    { status: "FAILED", label: "Đánh dấu thất bại", cls: "bg-accent/10 text-accent" },
  ],
};

export default async function OrderDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const orderId = toObjectId(id);
  if (!orderId) notFound();

  let order:
    | {
        id: string;
        code: string;
        status: string;
        total: number;
        vnpTxnRef: string | null;
        paymentInfo: Record<string, string> | null;
        createdAt: Date;
        paidAt: Date | null;
        user: { email?: string; name?: string | null } | null;
        items: { id: string; title: string; price: number; revoked: boolean; productSlug: string | null }[];
      }
    | null = null;

  try {
    await connectDb();
    const doc = await Order.findById(orderId)
      .populate("user", "email name")
      .populate({ path: "items.product", select: "slug title" })
      .lean();
    if (!doc) notFound();
    const d = doc as unknown as {
      _id: { toString(): string };
      code: string;
      status: string;
      total: number;
      vnpTxnRef: string | null;
      paymentInfo: Record<string, string> | null;
      createdAt: Date;
      paidAt: Date | null;
      user: { email?: string; name?: string | null } | null;
      items: Array<{
        _id: { toString(): string };
        title: string;
        price: number;
        revoked?: boolean;
        product: { slug?: string } | null;
      }>;
    };
    order = {
      id: d._id.toString(),
      code: d.code,
      status: d.status,
      total: d.total,
      vnpTxnRef: d.vnpTxnRef ?? null,
      paymentInfo: d.paymentInfo ?? null,
      createdAt: d.createdAt,
      paidAt: d.paidAt ?? null,
      user: d.user ?? null,
      items: d.items.map((it) => ({
        id: it._id.toString(),
        title: it.title,
        price: it.price,
        revoked: !!it.revoked,
        productSlug: it.product?.slug ?? null,
      })),
    };
  } catch {
    notFound();
  }

  const badge = statusBadge(order.status);
  const buttons = TRANSITION_BUTTONS[order.status] ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/don-hang" className="text-sm text-foreground/55 hover:text-accent">
        ← Tất cả đơn hàng
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{order.code}</h2>
          <p className="mt-1 text-sm text-foreground/55">
            Tạo lúc {fmtDateTime(order.createdAt)} · Thanh toán {fmtDateTime(order.paidAt)}
          </p>
        </div>
        <span className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${badge.cls}`}>{badge.text}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Nội dung đơn */}
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-3.5">
              <h3 className="font-semibold">Sản phẩm trong đơn</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line/60 text-left text-xs uppercase tracking-wide text-foreground/45">
                  <th className="px-5 py-2.5 font-medium">Sản phẩm</th>
                  <th className="px-5 py-2.5 font-medium">Giá</th>
                  <th className="px-5 py-2.5 font-medium">Quyền tải</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {it.productSlug ? (
                          <Link
                            href={`/bo-suu-tap/${it.productSlug}`}
                            className="font-medium text-accent hover:underline"
                          >
                            {it.title}
                          </Link>
                        ) : (
                          <span className="text-foreground/80">{it.title}</span>
                        )}
                        {it.revoked && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                            Đã thu hồi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatVND(it.price)}</td>
                    <td className="px-5 py-3">
                      {order.status === "PAID" ? (
                        <form action={toggleOrderItemRevoked}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="itemId" value={it.id} />
                          <button
                            type="submit"
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              it.revoked
                                ? "border-green-600/40 bg-green-600/10 text-green-600 hover:bg-green-600/20 dark:text-green-400"
                                : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                            }`}
                          >
                            {it.revoked ? "Hủy thu hồi" : "Thu hồi"}
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-line bg-background/40 px-5 py-3.5 text-sm">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-lg font-extrabold text-accent">{formatVND(order.total)}</span>
            </div>
          </section>

          {order.paymentInfo && (
            <section className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="mb-3 font-semibold">Thông tin thanh toán VNPay</h3>
              <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {Object.entries(order.paymentInfo).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="shrink-0 text-foreground/55">{k}</dt>
                    <dd className="min-w-0 truncate text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {order.vnpTxnRef && (
                <p className="mt-3 border-t border-line pt-3 text-sm text-foreground/55">
                  Mã giao dịch VNPay:{" "}
                  <span className="font-semibold text-foreground">{order.vnpTxnRef}</span>
                </p>
              )}
            </section>
          )}
        </div>

        {/* Cột phụ */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="mb-3 font-semibold">Khách hàng</h3>
            <p className="font-medium">{order.user?.name ?? "—"}</p>
            <p className="mt-0.5 break-all text-sm text-foreground/60">{order.user?.email ?? "—"}</p>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="mb-3 font-semibold">Cập nhật trạng thái</h3>
            {buttons.length > 0 ? (
              <div className="space-y-2.5">
                {buttons.map((b) => (
                  <form key={b.status} action={updateOrderStatus}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="status" value={b.status} />
                    <button
                      type="submit"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 ${b.cls}`}
                    >
                      {b.label}
                    </button>
                  </form>
                ))}
                <p className="pt-1 text-xs leading-relaxed text-foreground/45">
                  {order.status === "PENDING"
                    ? "Đơn chờ VNPay xác nhận. Bạn có thể cập nhật thủ công nếu khách đã chuyển khoản nhưng IPN chưa về."
                    : order.status === "PAID"
                      ? "Đơn đã thanh toán. Nếu cần, thu hồi quyền tải theo từng sản phẩm ở mục “Sản phẩm trong đơn”."
                      : "Đơn ở trạng thái cuối, không còn thao tác."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-foreground/55">
                Đơn ở trạng thái <b>{badge.text.toLowerCase()}</b>, không thể chuyển tiếp.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}