import crypto from "crypto";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function createDate(d: Date = new Date()) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

export function sortObject(obj: Record<string, string>) {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function sign(query: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(query).digest("hex");
}

export type CreatePaymentParams = {
  txnRef: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  returnUrl: string;
};

export function createPaymentUrl(params: CreatePaymentParams): string {
  const vnpParams: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: process.env.VNPAY_TMN_CODE ?? "",
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: params.txnRef,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: String(params.amount * 100),
    vnp_ReturnUrl: params.returnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: createDate(),
  };

  const sorted = sortObject(vnpParams);
  const query = new URLSearchParams(sorted).toString();
  const secureHash = sign(query, process.env.VNPAY_HASH_SECRET ?? "");
  return `${process.env.VNPAY_PAYMENT_URL}?${query}&vnp_SecureHash=${secureHash}`;
}

export type VerifyResult = {
  valid: boolean;
  txnRef: string;
  amount: number;
  responseCode: string;
  transactionStatus: string;
};

export function verifyVnpayQuery(searchParams: URLSearchParams): VerifyResult {
  const fields: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith("vnp_") && key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") {
      fields[key] = value;
    }
  });

  const hash = searchParams.get("vnp_SecureHash") ?? "";
  const signed = sign(
    new URLSearchParams(sortObject(fields)).toString(),
    process.env.VNPAY_HASH_SECRET ?? "",
  );

  return {
    valid: signed === hash,
    txnRef: fields.vnp_TxnRef ?? "",
    amount: Number(fields.vnp_Amount ?? 0) / 100,
    responseCode: fields.vnp_ResponseCode ?? "",
    transactionStatus: fields.vnp_TransactionStatus ?? "",
  };
}
