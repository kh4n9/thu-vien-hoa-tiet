// Kiểm tra VNPay tại chỗ: sinh URL thanh toán từ .env, verify chữ ký khứ hồi.
// Import trực tiếp lib/vnpay.ts (Node 26 type stripping) để test đúng code production.
import { readFileSync } from "node:fs";
import { createPaymentUrl, verifyVnpayQuery, sortObject } from "../lib/vnpay.ts";
import crypto from "node:crypto";

// — Đọc .env (chỉ cần các biến VNPAY + AUTH_URL), không in giá trị ra ngoài
function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const missing = ["VNPAY_TMN_CODE", "VNPAY_HASH_SECRET"].filter(
  (k) => !env[k] || env[k].includes("your-") || env[k].includes("thay-bang"),
);

const FAKE_SECRET = "test-secret-vnpay-sandbox-1234567890abcdef";
const FAKE_TMN = "FAKETMN00";

if (missing.length > 0) {
  console.log(
    `⚠️  ${missing.join(", ")} đang là placeholder trong .env — chạy CHẾ ĐỘ KIỂM TRA THUẬT TOÁN với secret giả.`,
  );
  console.log(`   Để test E2E thật với sandbox: điền TMN code + secret key từ https://sandbox.vnpayment.vn\n`);
  env.VNPAY_TMN_CODE = FAKE_TMN;
  env.VNPAY_HASH_SECRET = FAKE_SECRET;
}

// — Tuỳ chỉnh giá trị của các biến môi trường mà lib/vnpay đọc (chạy trong process này)
process.env.VNPAY_TMN_CODE = env.VNPAY_TMN_CODE;
process.env.VNPAY_HASH_SECRET = env.VNPAY_HASH_SECRET;
process.env.VNPAY_PAYMENT_URL = env.VNPAY_PAYMENT_URL;
process.env.VNPAY_RETURN_URL = env.VNPAY_RETURN_URL ?? "http://localhost:3000/checkout/return";

const tmnCode = env.VNPAY_TMN_CODE;
const secret = env.VNPAY_HASH_SECRET;

// — 1. Sinh URL thanh toán như createPayment action làm
const params = {
  txnRef: "TVT-TEST2026",
  amount: 150000,
  orderInfo: "Thanh toan don hang TVT-TEST2026",
  ipAddr: "127.0.0.1",
  returnUrl: process.env.VNPAY_RETURN_URL,
};
const url = createPaymentUrl(params);
const u = new URL(url);
console.log("1) URL thanh toán đã tạo:", url);

// — 2. Verify khứ hồi đúng bằng code production
const check1 = verifyVnpayQuery(u.searchParams);
console.log(
  "2) Verify khứ hồi ->", check1.valid ? "✓ HỢP LỆ" : "✗ KHÔNG HỢP LỆ",
  "| txnRef:", check1.txnRef, "| amount:", check1.amount, "| resp:", check1.responseCode,
);

// — 3. Sửa 1 ký tự trong chữ ký -> phải fail
const badUrl = new URL(url);
badUrl.searchParams.set("vnp_SecureHash", "0000" + check1.valid + url.slice(-60).split("=")[1] ?? "");
const check2 = verifyVnpayQuery(badUrl.searchParams);
console.log("3) URL chữ ký bị sửa ->", check2.valid ? "✗ VẪN HỢP LỆ (LỖI!)" : "✓ BỊ TỪ CHỐI (đúng)");

// — 4. Thêm tham số lạ không thuộc vnp_ -> chữ ký không đổi (đúng spec: chỉ hash các vnp_*)
const extraUrl = new URL(url);
extraUrl.searchParams.set("evil", "1");
const check3 = verifyVnpayQuery(extraUrl.searchParams);
console.log("4) Chèn tham số lạ (evil=1) ->", check3.valid ? "✓ vẫn hợp lệ (đúng: chỉ hash vnp_*)" : "✗ bị từ chối");

// — 5. Xây dựng mô phỏng IPN (đúng như VNPay sẽ POST tới /api/vnpay/ipn)
//    Bản sao logic createPaymentUrl nhưng với đủ tham số IPN, ký bằng đúng secret.
const ipnParams = {
  vnp_Amount: String(150000 * 100),
  vnp_BankCode: "NCB",
  vnp_TransactionNo: "14050701",
  vnp_OrderInfo: "Thanh toan don hang TVT-TEST2026",
  vnp_TransactionStatus: "00",
  vnp_ResponseCode: "00",
  vnp_TxnRef: "TVT-TEST2026",
  vnp_CreateDate: "20260907081000",
  vnp_PayDate: "20260907081015",
  vnp_Command: "pay",
  vnp_Version: "2.1.0",
  vnp_CurrCode: "VND",
  vnp_IpAddr: "127.0.0.1",
  vnp_Locale: "vn",
  vnp_OrderType: "other",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
  vnp_TmnCode: tmnCode,
};
const sorted = sortObject(ipnParams);
const qs = new URLSearchParams(sorted).toString();
const hash = crypto.createHmac("sha512", secret).update(qs).digest("hex");
const ipnQuery = new URLSearchParams(sorted);
ipnQuery.set("vnp_SecureHash", hash);

const ipn = verifyVnpayQuery(ipnQuery);
console.log(
  "5) Mô phỏng IPN thành công ->", ipn.valid ? "✓ HỢP LỆ" : "✗ KHÔNG HỢP LỆ",
  "| txnRef:", ipn.txnRef, "| amount:", ipn.amount, "| resp:", ipn.responseCode, "| trxStatus:", ipn.transactionStatus,
);
const ipnOk = ipn.valid && ipn.responseCode === "00" && ipn.transactionStatus === "00" && ipn.amount === 150000;
console.log(ipnOk ? "   → IPN sẽ được xử lý: order -> PAID ✓" : "   → IPN bị từ chối ✗");

// — 6. IPN sai chữ ký -> phải RspCode 97
const badIpn = new URLSearchParams(ipnQuery);
badIpn.set("vnp_SecureHash", "deadbeef");
const bad = verifyVnpayQuery(badIpn);
console.log("6) IPN sai chữ ký ->", bad.valid ? "✗ VẪN HỢP LỆ (LỖI!)" : "✓ bị từ chối → IPN route trả RspCode 97 (đúng)");

// — 7. Kiểm tra gateway sandbox reachable (dùng TMN giả — chủ yếu xem mạng tới VNPay được không)
try {
  const t0 = Date.now();
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
  const ms = Date.now() - t0;
  const body = await res.text().catch(() => "");
  const snippet = body.replace(/\s+/g, " ").slice(0, 90);
  console.log(`7) GET cổng thanh toán -> HTTP ${res.status} (${ms}ms) | ${snippet}`);
  if (res.status === 200 && /không|khong|kh\u00f4ng|merchant|not found|404/i.test(snippet)) {
    console.log("   → Cổng reachable; phản hồi từ chối TMN giả (đúng — chưa có tài khoản thật)");
  }
} catch (e) {
  console.log(`7) GET cổng thanh toán -> LỖI: ${e.cause?.code ?? e.message} (mạng/sandbox bị chặn?)`);
}

// — 8. Tổng kết
const ok = check1.valid && !check2.valid && check3.valid && ipnOk && !bad.valid;
console.log(ok ? "\n✅ TẤT CẢ KIỂM TRA THUẬT TOÁN VNPAY ĐẠT" : "\n❌ CÓ KIỂM TRA THẤT BẠI");
console.log(missing.length > 0 ? "⚠️ Còn thiếu TMN code + secret thật để chạy E2E với sandbox." : "🎉 Đã có đủ thông tin thật trong .env.");