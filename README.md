# Thư viện Họa Tiết

Web bán **file bản vẽ kỹ thuật họa tiết cổ truyền Á Đông** (hoa sen, trống đồng, sóng nước…) cho CNC, khắc gỗ, laser và thêu mỹ nghệ.

Khách đăng ký → mua qua **VNPay** → tải file trong **Thư viện của tôi**. Chủ web (admin) tự đăng sản phẩm. UI tiếng Việt, hỗ trợ sáng/tối.

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Supabase** Postgres + **Prisma** ORM
- **Auth.js v5** (email/password, bcrypt) — session JWT
- **Cloudflare R2** lưu file (bucket private) + presigned URL
- **VNPay** thanh toán (sandbox → live)
- Deploy: **Vercel**

## Cấu trúc

```
app/
  (shop)                     Trang công khai + tài khoản
  admin/                     Khu vực quản trị (CRUD sản phẩm, đơn hàng)
  api/auth/[...nextauth]/    Auth handler
  api/vnpay/ipn/             Webhook xác nhận thanh toán VNPay
  api/download/.../          Cấp link tải file (kiểm tra quyền sở hữu)
  media/[...key]/            Phục vụ ảnh preview từ R2
components/                  Header, footer, product card, form…
lib/                         prisma, auth, vnpay, r2, cart, actions
prisma/schema.prisma         Data model
```

## Cài đặt & chạy local

```bash
npm install
cp .env.example .env   # điền đầy đủ thông tin bên dưới
npx prisma generate
npx prisma migrate dev # tạo bảng trên Supabase
npx prisma db seed     # tạo chuyên mục + tài khoản admin
npm run dev
```

Mở http://localhost:3000. Đăng nhập admin bằng `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong `.env`.

## Biến môi trường (.env)

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Supabase connection string **pooler** (transaction mode) |
| `DIRECT_URL` | Supabase connection string trực tiếp (cho `prisma migrate`) |
| `AUTH_SECRET` | Tạo bằng `npx auth secret` — ký session cookie |
| `AUTH_URL` | URL site, VD `http://localhost:3000` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Tài khoản admin khi seed |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | Cloudflare R2 |
| `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_RETURN_URL`, `VNPAY_PAYMENT_URL`, `VNPAY_IPN_URL` | Cổng thanh toán VNPay |

## Luồng thanh toán

1. `createPayment` (server action) tạo `Order` trạng thái `PENDING`, trả URL VNPay.
2. Khách redirect sang VNPay; sau khi thanh toán, VNPay gọi **IPN** (`/api/vnpay/ipn`) — verify chữ ký, đối chiếu số tiền, đánh dấu `PAID`.
3. Khách quay lại `/checkout/return`; nếu đúng thì mở Thư viện.
4. Nút "Tải file" gọi `/api/download/{orderId}/{productId}` → chỉ user có đơn `PAID` chứa sản phẩm mới nhận presigned URL từ R2.

## Bảo mật file

- Bucket R2 **private**, file gốc không bao giờ public trực tiếp.
- Preview dùng ảnh riêng phục vụ qua `/media/*` có cache.
- Presigned URL ngắn hạn (5 phút) để tránh chia sẻ file.

## Deploy

1. Đẩy code lên GitHub → import vào Vercel.
2. Điền toàn bộ biến `.env` trong Vercel.
3. `npx prisma migrate deploy` (hoặc migrate khi build) để đồng bộ schema lên Supabase.
4. Đổi `VNPAY_RETURN_URL`/`VNPAY_IPN_URL` sang domain thật; chuyển `VNPAY_PAYMENT_URL` từ sandbox → production khi sẵn sàng.
