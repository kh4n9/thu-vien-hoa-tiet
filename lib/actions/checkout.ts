"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseCart } from "@/lib/cart";
import { generateOrderCode } from "@/lib/utils";
import { createPaymentUrl } from "@/lib/vnpay";

export async function createPayment(): Promise<{ url: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?next=/thanh-toan");

  const cookieStore = await cookies();
  const items = parseCart(cookieStore.get("cart")?.value);
  if (items.length === 0) return { error: "Giỏ hàng đang trống." };

  const ids = items.map((i) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
  });
  if (products.length === 0) return { error: "Sản phẩm không hợp lệ." };

  const total = products.reduce((sum, p) => {
    const qty = items.find((i) => i.id === p.id)?.qty ?? 1;
    return sum + p.price * qty;
  }, 0);

  const code = generateOrderCode();
  await prisma.order.create({
    data: {
      code,
      userId: session.user.id,
      status: "PENDING",
      total,
      items: {
        create: products.map((p) => ({
          productId: p.id,
          title: p.title,
          price: p.price,
        })),
      },
    },
  });

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ipAddr =
    forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "127.0.0.1";

  const returnUrl =
    process.env.VNPAY_RETURN_URL ?? `${process.env.AUTH_URL ?? "http://localhost:3000"}/checkout/return`;

  const url = createPaymentUrl({
    txnRef: code,
    amount: total,
    orderInfo: `Thanh toan don hang ${code}`,
    ipAddr,
    returnUrl,
  });

  return { url };
}
