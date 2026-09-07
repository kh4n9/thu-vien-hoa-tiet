"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseCart } from "@/lib/cart";
import { generateOrderCode } from "@/lib/utils";
import { createPaymentUrl } from "@/lib/vnpay";
import { Order, Product, toObjectIds } from "@/lib/models";

export async function createPayment(): Promise<{ url: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?next=/thanh-toan");

  const cookieStore = await cookies();
  const items = parseCart(cookieStore.get("cart")?.value);
  if (items.length === 0) return { error: "Giỏ hàng đang trống." };

  const ids = toObjectIds(items.map((i) => i.id));
  if (ids.length === 0) return { error: "Sản phẩm không hợp lệ." };

  await connectDb();
  const products = await Product.find({ _id: { $in: ids }, isActive: true }).lean();
  if (products.length === 0) return { error: "Sản phẩm không hợp lệ." };

  // File số: mỗi sản phẩm 1 bản.
  const total = products.reduce((sum, p) => sum + p.price, 0);

  const code = generateOrderCode();
  await Order.create({
    code,
    user: session.user.id,
    status: "PENDING",
    total,
    items: products.map((p) => ({ product: p._id, title: p.title, price: p.price })),
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