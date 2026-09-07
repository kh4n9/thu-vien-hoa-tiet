// E2E VNPay bằng Playwright + Edge — điền thẻ test trong IFRAME của cổng sandbox.
import { chromium } from "playwright-core";

const BASE = process.env.AUTH_URL ?? "http://localhost:3000";
const EMAIL = `e2e_${Date.now()}@test.vn`;
const PASSWORD = "E2E_test_12345";

async function main() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1380, height: 1000 }, locale: "vi-VN" });
  const step = (m) => console.log(m);

  try {
    await page.goto(`${BASE}/dang-ky`);
    await page.fill('input[name="name"]', "E2E Khach 2");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dang-nhap/, { timeout: 15000 });

    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.includes("dang-nhap"), { timeout: 15000 });
    step("1) Đăng nhập xong");

    await page.goto(`${BASE}/bo-suu-tap/hoa-sen-cach-dieu-cnc`);
    await page.getByRole("button", { name: /Thêm vào giỏ/i }).click();
    step("2) Thêm sản phẩm xong");

    await page.goto(`${BASE}/gio-hang`);
    await page.getByRole("link", { name: /Tiến hành thanh toán/i }).click();
    await page.waitForURL(/thanh-toan/, { timeout: 15000 });
    await page.getByRole("button", { name: /thanh toán|VNPay|Bấm vào đây/i }).first().click();
    await page.waitForURL((u) => u.hostname.includes("sandbox.vnpayment.vn"), { timeout: 30000 });
    step("3) Vào cổng VNPay -> chọn NCB/VNPAYQR");
    await page.waitForTimeout(1000);

    // Liệt kê all frames sau khi vào PaymentMethod
    await page.waitForTimeout(1500);
    const frames0 = page.frames().map((f) => f.url());
    step("\nframes(gate):");
    frames0.forEach((u) => step("   " + u));

    // Bấm nút chọn phương thức "Ngân hàng nội địa" / NCB
    const bankTab = page.locator('a,button,div,li:has-text("Ngân hàng nội địa"), :has-text("Thẻ nội địa"), :has-text("NCB")').last();
    if (await bankTab.isVisible().catch(() => false)) {
      await bankTab.click().catch(() => null);
      step("   (đã chọn tab ngân hàng)");
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: "vnpay-method.png" });

    // Lướt frames: tìm form thẻ
    let done = false;
    for (let iter = 0; iter < 6 && !done; iter++) {
      await page.waitForTimeout(1800);
      const frames = page.frames();
      step(`\n--- vòng ${iter}: ${frames.length} frame(s) ---`);
      const toy = /sandbox\.vnpayment\.vn|vnpay\.vn/i;
      for (const f of frames) {
        const u = f.url();
        if (!toy.test(u)) continue;
        step("   frame: " + u);
        // Tìm thẻ/button trong frame này
        const card = f.locator('input[name="cardNo"], input[maxlength="19"], input[placeholder*="Card"]').first();
        if (await card.isVisible().catch(() => false)) {
          step("      🔎 tìm thấy ô số thẻ trong frame!");
          await card.click().catch(() => null);
          await card.fill("9704198526191432198");
          await page.waitForTimeout(300);
          const exp = f.locator('input[name*="expire"], input[maxlength="4"], input[maxlength="7"], input[placeholder*="MM"]').first();
          if (await exp.isVisible().catch(() => false)) await exp.fill("2510");
          const nm = f.locator('input[name*="name"], input[placeholder*="Holder"]').first();
          if (await nm.isVisible().catch(() => false)) await nm.fill("NGUYEN VAN A");
          await page.screenshot({ path: "vnpay-card-filled.png" });
          // Nút confirm trong frame hoặc trang
          const btn = f
            .locator('button:has-text("Pay"), button:has-text("Thanh toán"), button:has-text("Xác nhận"), button:has-text("Continue"), input[type="submit"]')
            .last();
          if (await btn.isVisible().catch(() => false)) {
            await btn.click().catch(() => null);
            step("      (đã bấm nút xác nhận trong frame)");
          }
          done = true;
        }
      }
    }

    // Nhập OTP nếu có
    await page.waitForTimeout(2000);
    const allFrames = page.frames();
    for (const f of allFrames) {
      const otp = f
        .locator('input[maxlength="6"], input[name*="otp"], input[placeholder*="OTP"], input[type="password"]')
        .first();
      if (await otp.isVisible().catch(() => false)) {
        await otp.fill("OTP");
        const ok = f.locator('button:has-text("Pay"), button:has-text("Xác nhận"), button:has-text("OK"), input[type="submit"]').last();
        await ok.click().catch(() => null);
        step("   (đã nhập OTP)");
        break;
      }
    }

    // Chờ về app
    const returned = await page
      .waitForURL((u) => u.pathname.includes("checkout/return") || u.pathname === "/thu-vien", { timeout: 45000 })
      .then(true)
      .catch(false);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "vnpay-final2.png", fullPage: true });
    step("\nRESULT: " + (returned ? "✅ ĐÃ QUAY LẠI APP → " : "❌ chưa về app → ") + page.url());
    // Kiểm tra order PAID
    const { connectDb } = await import("../lib/db.ts");
    const { Order } = await import("../lib/models.ts");
    await connectDb();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(3).lean();
    step("\n3 đơn hàng gần nhất:");
    orders.forEach((o) =>
      step(`   ${o.code} | ${o.status} | ${o.total}đ | user=${o.user} | paidAt=${o.paidAt}`),
    );
  } catch (e) {
    console.error("LỖI:", e.message);
    await page.screenshot({ path: "vnpay-error2.png" }).catch(() => null);
  } finally {
    await browser.close();
  }
}
main();