# Thư viện Họa Tiết

Web bán **file bản vẽ kỹ thuật họa tiết cổ truyền Á Đông** (hoa sen, trống đồng, sóng nước…) cho CNC, khắc gỗ, laser và thêu mỹ nghệ.

Khách đăng ký → mua qua **VNPay** → tải file trong **Thư viện của tôi**. Chủ web (admin) tự đăng sản phẩm. UI tiếng Việt, hỗ trợ sáng/tối.

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **MongoDB Atlas + Mongoose** (ODM thuần JS — chạy tốt trên mọi nền tảng, kể cả Windows ARM64)
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
lib/                         models (Mongoose), db, auth, vnpay, r2, cart, actions
scripts/                     seed, dbcheck, vnpay-selfcheck, fetch-node (xem dưới)
```

## Cài đặt & chạy local

### 1. Tạo MongoDB Atlas (miễn phí, ~5 phút)

1. Vào https://www.mongodb.com/atlas → tạo tài khoản → **Create Cluster** (chọn **M0 Free**, lấy tên cluster tùy ý).
2. Chờ cluster tạo xong (~1–3 phút) → bấm **Connect** → chọn **Drivers** → **Node.js**.
3. Copy connection string, thay `<password>` bằng mật khẩu database user của bạn, thêm tên database vào (VD `thuvien-hoa-tiet`) → dán vào `.env`:

```
MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/thuvien-hoa-tiet?retryWrites=true&w=majority"
```

### 2. Chạy

```bash
npm install
cp .env.example .env   # điền MONGODB_URI + các biến khác
npm run db:seed        # tạo chuyên mục + admin + sản phẩm mẫu
npm run dev
```

Mở http://localhost:3000. Đăng nhập admin bằng `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong `.env`.

> Nếu chạy `db:seed` lại với tài khoản admin đã tồn tại, script chỉ cập nhật `role = ADMIN` (không ghi đè mật khẩu). Muốn đổi mật khẩu admin: sửa `ADMIN_PASSWORD` trong `.env`, xóa document `users` có email admin trên Atlas (Browse Collections) rồi chạy seed lại.

## Biến môi trường (.env)

| Biến | Mô tả |
|---|---|
| `MONGODB_URI` | Connection string MongoDB Atlas (đã thêm tên database) |
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

## Kiểm tra VNPay

```bash
node scripts/vnpay-selfcheck.mjs
```

Script kiểm tra: sinh URL thanh toán, verify chữ ký khứ hồi, từ chối chữ ký bị sửa, mô phỏng IPN thành công/thất bại và check cổng sandbox reachable. Chạy trước với secret giả để kiểm tra thuật toán; sau khi điền `VNPAY_TMN_CODE` + `VNPAY_HASH_SECRET` thật (lấy tại https://sandbox.vnpayment.vn) chạy lại để xác nhận, rồi test E2E bằng **thẻ test NCB**: số `9704198526191432198`, hạn `07/25`, OTP nhập `OTP`.

## Kiểm tra kết nối MongoDB

```bash
node --env-file=.env scripts/dbcheck.mjs
```

## Chạy local trên Windows ARM64 (máy Snapdragon X, Surface ARM)

Hai lưu ý trên Windows ARM64:

1. **Node 26 (bản arm64, kèm OpenSSL 3.5.7) bị chặn khi bắt tay TLS với MongoDB Atlas** (`tlsv1 alert internal error` — server từ chối ClientHello; mọi tùy chọn TLS đều fail, trong khi Python/schannel kết nối OK). Giải pháp: dùng **Node LTS v22 arm64** (OpenSSL 3.0.x):

   ```bash
   node scripts/fetch-node.mjs     # tải Node v22 LTS win-arm64 về .node-lts\ (đã gitignore)
   .\.node-lts\node-v22.23.2-win-arm64\node.exe --version
   ```

2. Chạy dev/build bằng Node đó — prepend thư mục vào PATH rồi dùng npm như bình thường:

   ```powershell
   $env:PATH = "$PWD\.node-lts\node-v22.23.2-win-arm64;$env:PATH"
   npm install && npm run db:seed
   npm run dev        # giờ query được DB thật ngay trên Windows
   ```

   (Các script Node dùng `npm run db:seed` cần chạy qua Node v22; file `.ts` import được nhờ type stripping của Node ≥ v22.6.)

Vercel build không bị ảnh hưởng (chạy trên Linux x64 của Vercel).

## Bảo mật file

- Bucket R2 **private**, file gốc không bao giờ public trực tiếp.
- Preview dùng ảnh riêng phục vụ qua `/media/*` có cache.
- Presigned URL ngắn hạn (5 phút) để tránh chia sẻ file.
- Mongo chỉ chấp nhận kết nối từ IP của bạn (Network Access trong Atlas) — cấu hình IP Access List trước khi deploy.

## Deploy

1. Đẩy code lên GitHub → import vào Vercel.
2. Điền toàn bộ biến `.env` trong Vercel (kể cả `MONGODB_URI`).
3. Chạy seed một lần trên môi trường deploy (hoặc chạy `npm run db:seed` cục bộ — DB là cloud nên dữ liệu dùng chung).
4. Trong Atlas: Network Access → **Allow access from anywhere** (nếu chấp nhận) hoặc thêm IP Vercel, và tạo database user với password mạnh.
5. Đổi `VNPAY_RETURN_URL`/`VNPAY_IPN_URL` sang domain thật; chuyển `VNPAY_PAYMENT_URL` từ sandbox → production khi sẵn sàng.