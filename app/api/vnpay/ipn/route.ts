import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { Order } from "@/lib/models";
import { verifyVnpayQuery } from "@/lib/vnpay";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const result = verifyVnpayQuery(url.searchParams);

  if (!result.valid) {
    return Response.json({ RspCode: "97", Message: "Invalid Signature" });
  }
  if (result.responseCode !== "00" || result.transactionStatus !== "00") {
    return Response.json({ RspCode: "02", Message: "Order not paid" });
  }

  try {
    await connectDb();
    const order = await Order.findOne({ code: result.txnRef }).lean();
    if (!order) {
      return Response.json({ RspCode: "01", Message: "Order not found" });
    }
    if (order.total !== result.amount) {
      return Response.json({ RspCode: "04", Message: "Amount invalid" });
    }
    if (order.status === "PAID") {
      return Response.json({ RspCode: "00", Message: "Confirm Success" });
    }

    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          status: "PAID",
          paidAt: new Date(),
          vnpTxnRef: url.searchParams.get("vnp_TransactionNo"),
          paymentInfo: Object.fromEntries(url.searchParams.entries()),
        },
      },
    );

    return Response.json({ RspCode: "00", Message: "Confirm Success" });
  } catch {
    return Response.json({ RspCode: "99", Message: "Unknown error" });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}