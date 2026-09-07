import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCart } from "@/lib/cart";
import { formatVND } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkout-button";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?next=/thanh-toan");

  const cookieStore = await cookies();
  const items = parseCart(cookieStore.get("cart")?.value);

  let products: Awaited<ReturnType<typeof getProducts>> = [];
  if (items.length > 0) {
    products = await getProducts(items.map((i) => i.id));
  }

  const lines = items
    .map((item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? { ...p, qty: item.qty } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  if (lines.length === 0) {
    redirect("/gio-hang");
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">Thanh toán</h1>

      <div className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">Đơn hàng của bạn</h2>
        <div className="space-y-2 text-sm">
          {lines.map((line) => (
            <div key={line.id} className="flex justify-between gap-4">
              <span className="min-w-0 truncate">{line.title}</span>
              <span className="font-medium">{formatVND(line.price)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
          <span>Tổng cộng</span>
          <span>{formatVND(total)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">Phương thức thanh toán</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch. Sau khi thanh toán
          thành công, file sẽ có ngay trong Thư viện của bạn.
        </p>
        <div className="mt-5">
          <CheckoutButton />
        </div>
        <Link href="/gio-hang" className="mt-3 inline-block text-sm text-foreground/50 hover:text-accent">
          ← Quay lại giỏ hàng
        </Link>
      </div>
    </div>
  );
}

async function getProducts(ids: string[]) {
  return prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, title: true, price: true },
  });
}
