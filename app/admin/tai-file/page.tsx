import Link from "next/link";
import { connectDb } from "@/lib/db";
import { DownloadRecord } from "@/lib/models";
import { fmtDateTime } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AdminDownloads() {
  let rows: {
    id: string;
    userLabel: string;
    productLabel: string;
    productSlug: string | null;
    orderId: string | null;
    ip: string | null;
    createdAt: Date;
  }[] = [];

  try {
    await connectDb();
    const docs = await DownloadRecord.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "email name")
      .populate("product", "title slug")
      .lean();

    rows = (docs as unknown as Array<{
      _id: { toString(): string };
      user: { email?: string; name?: string | null } | null;
      product: { title?: string; slug?: string } | null;
      order: { toString(): string } | null;
      ip: string | null;
      createdAt: Date;
    }>).map((d) => ({
      id: d._id.toString(),
      userLabel: d.user?.name ?? d.user?.email ?? "—",
      productLabel: d.product?.title ?? "—",
      productSlug: d.product?.slug ?? null,
      orderId: d.order ? d.order.toString() : null,
      ip: d.ip ?? null,
      createdAt: d.createdAt,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Lịch sử tải file</h2>
        <p className="mt-1 text-sm text-foreground/55">
          100 lượt tải gần nhất — mỗi lần tải thành công đều được ghi lại.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground/45">
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">Đơn hàng</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-foreground/45">
                  Chưa có lượt tải nào.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-foreground/60">{fmtDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3 text-foreground/70">{r.userLabel}</td>
                  <td className="px-4 py-3">
                    {r.productSlug ? (
                      <Link href={`/bo-suu-tap/${r.productSlug}`} className="font-medium text-accent hover:underline">
                        {r.productLabel}
                      </Link>
                    ) : (
                      r.productLabel
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.orderId ? (
                      <Link href={`/admin/don-hang/${r.orderId}`} className="text-accent hover:underline">
                        Xem đơn
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/50">{r.ip ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}