import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";
import { DownloadRecord, Order, toObjectId, type OrderItemBase, type ObjectId, type ProductDoc } from "@/lib/models";

type Params = Promise<{ orderId: string; productId: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { orderId, productId } = await params;
  const oid = toObjectId(orderId);
  const pid = toObjectId(productId);
  const uid = toObjectId(session.user.id);
  if (!oid || !pid || !uid) {
    return NextResponse.json({ error: "Bạn không có quyền tải file này." }, { status: 403 });
  }

  let fileKey: string | null = null;
  try {
    await connectDb();
    const order = await Order.findOne({
      _id: oid,
      user: uid,
      status: "PAID",
      "items.product": pid,
    })
      .populate({ path: "items.product", select: "fileKey title" })
      .lean();

    const item = order?.items.find(
      (i: OrderItemBase & { _id: ObjectId }) =>
        (i.product as unknown as ProductDoc | null)?._id?.toString() === productId,
    );
    fileKey = (item?.product as unknown as ProductDoc | undefined)?.fileKey ?? null;
  } catch {
    /* DB lỗi → từ chối */
  }

  if (!fileKey) {
    return NextResponse.json(
      { error: "Bạn không có quyền tải file này." },
      { status: 403 },
    );
  }

  const url = await getSignedDownloadUrl(fileKey);

  await DownloadRecord.create({
    user: uid,
    product: pid,
    order: oid,
  }).catch(() => null);

  return NextResponse.redirect(url);
}