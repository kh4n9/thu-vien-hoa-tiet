import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Order } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { statusBadge, fmtDateTime, escapeRegex } from "@/lib/status";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUS_ORDER = ["PENDING", "PAID", "CANCELLED", "FAILED", "REFUNDED"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminOrders({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status ? sp.status : "ALL";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);

  let docs: Array<{
    id: string;
    code: string;
    status: string;
    total: number;
    itemCount: number;
    userLabel: string;
    createdAt: Date;
    paidAt: Date | null;
  }> = [];
  let total = 0;

  try {
    await connectDb();
    const filter: Record<string, unknown> = {};
    if (status !== "ALL") filter.status = status;
    if (q) filter.code = { $regex: escapeRegex(q), $options: "i" };

    const [list, count] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .populate("user", "email name")
        .lean(),
      Order.countDocuments(filter),
    ]);
    total = count;
    docs = (list as Array<{
      _id: { toString(): string };
      code: string;
      status: string;
      total: number;
      items: unknown[];
      createdAt: Date;
      paidAt: Date | null;
      user: { email?: string; name?: string | null } | null;
    }>).map((o) => ({
      id: o._id.toString(),
      code: o.code,
      status: o.status,
      total: o.total,
      itemCount: o.items.length,
      userLabel: o.user?.name ?? o.user?.email ?? "—",
      createdAt: o.createdAt,
      paidAt: o.paidAt ?? null,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = new URLSearchParams();
  if (status !== "ALL") base.set("status", status);
  if (q) base.set("q", q);
  const makeHref = (p: number) => {
    const s = new URLSearchParams(base);
    if (p > 1) s.set("page", String(p));
    else s.delete("page");
    const qs = s.toString();
    return `/admin/don-hang${qs ? `?${qs}` : ""}`;
  };
  const filterHref = (s: string, keepQ: boolean) => {
    const u = new URLSearchParams();
    if (s !== "ALL") u.set("status", s);
    if (keepQ && q) u.set("q", q);
    const qs = u.toString();
    return `/admin/don-hang${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Đơn hàng</h2>
          <p className="mt-1 text-sm text-foreground/55">Tất cả đơn hàng trong hệ thống ({total}).</p>
        </div>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap gap-2">
        {["ALL", ...STATUS_ORDER].map((s) => {
          const active = status === s;
          const badge = s === "ALL" ? { text: "Tất cả" } : statusBadge(s);
          return (
            <Link
              key={s}
              href={filterHref(s, true)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface hover:border-accent hover:text-accent"
              }`}
            >
              {badge.text}
            </Link>
          );
        })}
      </div>

      {/* Tìm kiếm theo mã */}
      <form method="get" className="flex gap-2">
        {status !== "ALL" && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Tìm theo mã đơn (VD: TVT-…)…"
          className="h-10 w-full max-w-sm rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="h-10 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Tìm
        </button>
        {q && (
          <Link
            href={filterHref(status, false)}
            className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-sm text-foreground/60 transition-colors hover:text-accent"
          >
            Bỏ lọc
          </Link>
        )}
      </form>

      {/* Bảng */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground/45">
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 text-center font-medium">SL</th>
              <th className="px-4 py-3 font-medium">Tổng</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Tạo lúc</th>
              <th className="px-4 py-3 font-medium">Thanh toán</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-foreground/45">
                  Không có đơn hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              docs.map((o) => {
                const badge = statusBadge(o.status);
                return (
                  <tr key={o.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 font-semibold">{o.code}</td>
                    <td className="px-4 py-3 text-foreground/70">{o.userLabel}</td>
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

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}