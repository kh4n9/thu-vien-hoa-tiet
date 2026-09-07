import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/r2";

type Params = Promise<{ orderId: string; productId: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { orderId, productId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
      status: "PAID",
      items: { some: { productId } },
    },
    include: {
      items: {
        where: { productId },
        include: { product: { select: { fileKey: true, title: true } } },
      },
    },
  });

  if (!order || order.items.length === 0) {
    return NextResponse.json(
      { error: "Bạn không có quyền tải file này." },
      { status: 403 },
    );
  }

  const fileKey = order.items[0].product.fileKey;

  const url = await getSignedDownloadUrl(fileKey);

  await prisma.downloadRecord
    .create({
      data: { userId: session.user.id, productId, orderId },
    })
    .catch(() => null);

  return NextResponse.redirect(url);
}