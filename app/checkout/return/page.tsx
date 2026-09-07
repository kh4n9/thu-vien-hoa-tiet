import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Order } from "@/lib/models";
import { verifyVnpayQuery } from "@/lib/vnpay";
import { formatVND } from "@/lib/utils";
import { ClearCartOnSuccess } from "@/components/clear-cart";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReturnPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const query = new URLSearchParams();
  Object.entries(sp).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  const result = verifyVnpayQuery(query);

  let order: { code: string; total: number; status: string } | null = null;
  if (result.txnRef) {
    try {
      await connectDb();
      const doc = await Order.findOne({ code: result.txnRef })
        .select({ code: 1, total: 1, status: 1 })
        .lean();
      if (doc) order = { code: doc.code, total: doc.total, status: doc.status };
    } catch {
      /* DB chưa kết nối */
    }
  }

  const success =
    result.valid &&
    result.responseCode === "00" &&
    order !== null &&
    order.total === result.amount;

  if (success && order && order.status !== "PAID") {
    try {
      await Order.updateOne(
        { code: order.code },
        {
          $set: {
            status: "PAID",
            paidAt: new Date(),
            vnpTxnRef: sp.vnp_TransactionNo ? String(sp.vnp_TransactionNo) : null,
            paymentInfo: Object.fromEntries(query.entries()),
          },
        },
      );
    } catch {
      /* bỏ qua — IPN sẽ tự cập nhật */
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-24 text-center">
      {success ? (
        <>
          <ClearCartOnSuccess />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl text-accent">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">Thanh toán thành công</h1>
          <p className="mt-3 text-foreground/60">
            Đơn hàng <span className="font-semibold text-foreground">{order?.code}</span> với tổng
            trị giá <span className="font-semibold text-foreground">{formatVND(order?.total ?? 0)}</span>{" "}
            đã được thanh toán.
          </p>
          <p className="mt-2 text-foreground/60">
            File của bạn đã sẵn sàng trong Thư viện.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/thu-vien"
              className="inline-flex h-12 items-center rounded-full bg-accent px-7 font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Đi tới Thư viện
            </Link>
            <Link
              href="/bo-suu-tap"
              className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-7 font-semibold transition-colors hover:bg-line/40"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-line text-3xl text-foreground/60">
            !
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">Giao dịch chưa hoàn tất</h1>
          <p className="mt-3 text-foreground/60">
            Thanh toán không thành công hoặc đã bị hủy. Bạn có thể thử lại hoặc kiểm tra lại đơn
            hàng trong Thư viện.
          </p>
          <div className="mt-8">
            <Link
              href="/gio-hang"
              className="inline-flex h-12 items-center rounded-full bg-accent px-7 font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </>
      )}
    </div>
  );
}