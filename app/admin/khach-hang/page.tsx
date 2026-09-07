import Link from "next/link";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { formatVND } from "@/lib/utils";
import { fmtDate, escapeRegex } from "@/lib/status";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCustomers({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  let customers: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    orderCount: number;
    paidOrders: number;
    spent: number;
  }[] = [];

  try {
    await connectDb();
    const match: Record<string, unknown> = {};
    if (q) {
      match.$or = [
        { email: { $regex: escapeRegex(q), $options: "i" } },
        { name: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    const docs = (await User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user",
          as: "orders",
        },
      },
      {
        $project: {
          email: 1,
          name: 1,
          role: 1,
          createdAt: 1,
          orderCount: { $size: "$orders" },
          paidOrders: {
            $size: {
              $filter: {
                input: "$orders",
                as: "o",
                cond: { $eq: ["$$o.status", "PAID"] },
              },
            },
          },
          spent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$orders",
                    as: "o",
                    cond: { $eq: ["$$o.status", "PAID"] },
                  },
                },
                as: "o",
                in: "$$o.total",
              },
            },
          },
        },
      },
      { $sort: { spent: -1, createdAt: -1 } },
    ])) as Array<{
      _id: { toString(): string };
      email: string;
      name: string | null;
      role: string;
      createdAt: Date;
      orderCount: number;
      paidOrders: number;
      spent: number;
    }>;

    customers = docs.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: u.orderCount,
      paidOrders: u.paidOrders,
      spent: u.spent,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Khách hàng</h2>
        <p className="mt-1 text-sm text-foreground/55">
          Tài khoản đã đăng ký và giá trị họ mang lại ({customers.length}).
        </p>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Tìm theo email / tên…"
          className="h-10 w-full max-w-sm rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="h-10 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Tìm
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-foreground/45">
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Đăng ký</th>
              <th className="px-4 py-3 text-center font-medium">Đơn</th>
              <th className="px-4 py-3 text-center font-medium">Đã thanh toán</th>
              <th className="px-4 py-3 text-right font-medium">Tổng chi</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-foreground/45">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/khach-hang/${c.id}`} className="group block max-w-xs">
                      <p className="font-medium group-hover:text-accent">{c.name ?? "—"}</p>
                      <p className="break-all text-xs text-foreground/50 group-hover:text-foreground/70">
                        {c.email}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {c.role === "ADMIN" ? (
                      <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-line px-2.5 py-0.5 text-xs text-foreground/60">
                        Khách
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-center">{c.orderCount}</td>
                  <td className="px-4 py-3 text-center font-semibold">{c.paidOrders}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatVND(c.spent)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-foreground/45">
        Gợi ý: xem chi tiết đơn của từng khách hàng tại trang{" "}
        <Link href="/admin/don-hang" className="text-accent hover:underline">
          Đơn hàng
        </Link>
        .
      </p>
    </div>
  );
}