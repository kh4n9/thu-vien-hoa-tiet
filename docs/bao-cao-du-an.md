# BÁO CÁO DỰ ÁN — THƯ VIỆN HỌA TIẾT

**Hệ thống bán bản vẽ kỹ thuật họa tiết cổ truyền trực tuyến**
**Báo cáo chi tiết dự án — dành cho khách hàng xem xét & giám đốc phê duyệt**

- Ngày báo cáo: tháng 9/2026
- Phiên bản tài liệu: 1.0
- Trạng thái dự án: ✅ Giai đoạn 1 hoàn thành — hệ thống đang chạy trên môi trường thử nghiệm (VNPay sandbox), sẵn sàng bàn giao & vận hành thật

---

## MỤC LỤC

1. [Tóm tắt điều hành](#1-tóm-tắt-điều-hành)
2. [Giới thiệu & mục tiêu dự án](#2-giới-thiệu--mục-tiêu-dự-án)
3. [Công nghệ & kiến trúc hệ thống](#3-công-nghệ--kiến-trúc-hệ-thống)
4. [Danh mục tính năng chi tiết](#4-danh-mục-tính-năng-chi-tiết)
5. [Hướng dẫn sử dụng hệ thống](#5-hướng-dẫn-sử-dụng-hệ-thống)
6. [Hướng dẫn vận hành](#6-hướng-dẫn-vận-hành)
7. [Chi phí đầu tư — bảng giá theo tính năng](#7-chi-phí-đầu-tư--bảng-giá-theo-tính-năng)
8. [Chi phí vận hành định kỳ & phân chia giữa các bên](#8-chi-phí-vận-hành-định-kỳ--phân-chia-giữa-các-bên)
9. [Tính năng mở rộng trong tương lai](#9-tính-năng-mở-rộng-trong-tương-lai)
10. [Chính sách bảo hành trọn đời](#10-chính-sách-bảo-hành-trọn-đời)
11. [Bảo mật & an toàn dữ liệu](#11-bảo-mật--an-toàn-dữ-liệu)
12. [Quy trình bàn giao](#12-quy-trình-bàn-giao)
13. [Câu hỏi thường gặp (FAQ)](#13-câu-hỏi-thường-gặp-faq)

---

## 1. TÓM TẮT ĐIỀU HÀNH

**Thư viện Họa Tiết** là hệ thống **thương mại điện tử bán bản vẽ kỹ thuật số** (họa tiết cổ truyền Á Đông dành cho CNC, khắc gỗ, laser, thêu mỹ nghệ). Khách hàng duyệt bộ sưu tập → thanh toán trực tuyến (VNPay) → **tải file ngay lập tức** vào "Thư viện của tôi". Đi kèm là **khu quản trị (Admin) chuyên nghiệp** để chủ shop quản lý sản phẩm, đơn hàng, khách hàng, doanh thu.

| Hạng mục | Nội dung |
|---|---|
| **Tổng đầu tư phát triển (đề xuất)** | ~45.000.000 VNĐ (bảng giá chi tiết theo tính năng tại [Mục 7](#7-chi-phí-đầu-tư--bảng-giá-theo-tính-năng)) |
| **Chi phí vận hành định kỳ** | ~200.000–500.000 VNĐ/tháng (1 VPS chạy Dokploy + tên miền — chi tiết [Mục 8](#8-chi-phí-vận-hành-định-kỳ--phân-chia-giữa-các-bên)) |
| **Thời gian triển khai** | Đã hoàn thành & chạy thử (VNPay sandbox) — bàn giao ngay sau khi đăng ký cổng thanh toán chính thức |
| **Bảo hành** | **Trọn đời** cho phần sửa lỗi & hỗ trợ vận hành (điều khoản chi tiết [Mục 10](#10-chính-sách-bảo-hành-trọn-đời)) |
| **Tính năng hiện có** | 20+ tính năng hoàn chỉnh (Mục 4) |
| **Khả năng mở rộng** | 15+ hạng mục đã được thiết kế sẵn phần mở rộng (Mục 9) |

**Điểm nổi bật:**
- 🟢 **Tự động hóa bán hàng**: thanh toán VNPay + tự động cấp quyền tải file ngay sau khi thanh toán thành công — không cần can thiệp tay.
- 🟢 **Kiểm soát quyền tải chặt chẽ**: file chỉ tải được bởi đúng tài khoản đã mua; admin có thể **thu hồi/hủy thu hồi từng bản vẽ** khi cần (vi phạm giấy phép, hoàn trả…).
- 🟢 **Quản trị mọi thứ trên một màn hình**: doanh thu, đơn hàng, sản phẩm, khách hàng, lịch sử tải file.
- 🟢 **Xác thực 2 hình thức**: đăng nhập email/mật khẩu + đăng nhập Google (OAuth) — sẵn sàng mở rộng Facebook/GitHub/Zalo.
- 🟢 **Giao diện chuẩn thương mại**: tối ưu di động, chế độ sáng/tối, tiếng Việt.

---

## 2. GIỚI THIỆU & MỤC TIÊU DỰ ÁN

### 2.1. Bối cảnh
Chủ shop hiện bán bản vẽ họa tiết (DXF, AI, PDF…) bằng phương thức thủ công (nhắn tin, chuyển khoản, gửi file qua email/Zalo). Phương thức này:
- Tốn thời gian, dễ sót đơn, không kiểm soát được ai đã mua gì.
- Không có không gian giới thiệu sản phẩm chuyên nghiệp.
- File dễ bị chuyển tiếp trái phép, không thu hồi được.

### 2.2. Mục tiêu dự án
1. **Xây kênh bán hàng tự động 24/7**: khách tự xem, tự thanh toán, tự tải file.
2. **Chuyên nghiệp hóa hình ảnh** cửa hàng (giao diện thương hiệu "Sơn mài & vàng lá").
3. **Kiểm soát & thu hồi quyền tải** file khi cần.
4. **Báo cáo kinh doanh** rõ ràng cho chủ shop (doanh thu, đơn hàng, khách hàng).
5. Nền tảng **sẵn sàng mở rộng** (thêm cổng thanh toán, thêm nền tảng đăng nhập, thêm kênh bán, membership…).

### 2.3. Đối tượng sử dụng
| Nhóm | Vai trò |
|---|---|
| **Khách hàng mua bản vẽ** | Duyệt, mua, thanh toán, tải file |
| **Chủ shop / Admin** | Quản lý sản phẩm, đơn hàng, khách hàng, báo cáo |

---

## 3. CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG

### 3.1. Công nghệ
| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| **Frontend + Backend** | Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4, Turbopack) | Toàn bộ trong 1 codebase — dễ bảo trì |
| **Cơ sở dữ liệu** | MongoDB (Mongoose 9) — chạy trong Docker trên VPS (không cần Atlas trả phí) | Lưu user, sản phẩm, đơn hàng, chuyên mục, lịch sử tải |
| **Lưu trữ file bản vẽ & ảnh** | MinIO (S3 tương thích) chạy trên VPS — hoặc Cloudflare R2 gói miễn phí 10GB | File gửi qua **URL ký tạm (presigned)** — code không đổi, chỉ đổi endpoint |
| **Thanh toán** | VNPay (HMAC-SHA512) — sandbox → production | IPN (thông báo giao dịch) + verify chữ ký khứ hồi |
| **Xác thực** | Auth.js v5 (JWT session) + Google OAuth | Email/mật khẩu (bcrypt) + Google |
| **Triển khai** | 1 VPS Linux chạy **Dokploy** (miễn phí, nguồn mở) — Docker quản lý app + MongoDB + MinIO, Traefik cấp SSL tự động (Let's Encrypt) | Chi phí = 1 VPS + tên miền |

### 3.2. Kiến trúc tổng quan

```
Khách hàng (PC/Mobile)
      │
      ▼
┌──────────────────────────────┐
│   NODE SERVER (Next.js 16)   │
│  ┌───────────┐ ┌───────────┐ │
│  │ Web bán   │ │ Admin     │ │
│  │ (KH)      │ │ (chủ shop)│ │
│  └─────┬─────┘ └─────┬─────┘ │
└────────┼──────────────┼──────┘
         │              │
    ┌────▼────┐   ┌─────▼─────┐
    │ MongoDB │   │Cloudflare │
    │ Atlas   │   │R2 (file)  │
    └────┬────┘   └─────┬─────┘
         │              │
    ┌────▼──────────────▼────┐
    │      VNPay (cổng)      │
    │  IPN → Đánh dấu PAID   │
    └────────────────────────┘
```

### 3.3. Mô hình dữ liệu (tóm tắt)
- **User**: email, tên, ảnh, mật khẩu (hash), vai trò (Khách/Admin).
- **Category**: chuyên mục (Hoa sen, Trống đồng, Sóng nước…).
- **Product**: tiêu đề, mô tả, giá, định dạng, file bản vẽ (R2), **1–nhiều ảnh minh họa**, thông số kỹ thuật, trạng thái hiển thị.
- **Order**: mã đơn, khách hàng, trạng thái (Chờ thanh toán/Đã thanh toán/Thất bại/Đã hủy), sản phẩm kèm theo, **cờ thu hồi theo từng sản phẩm**, thông tin giao dịch VNPay.
- **DownloadRecord**: lịch sử tải file (ai, file nào, đơn nào, IP, thời gian).

> **Ghi chú kỹ thuật quan trọng khi vận hành trên Windows ARM64 (máy Surface Snapdragon):** cần dùng Node.js v22 LTS (kèm OpenSSL 3.0.x); Node 26 bản ARM64 bị chặn TLS khi kết nối MongoDB Atlas. Chi tiết đã ghi trong README của dự án.

---

## 4. DANH MỤC TÍNH NĂNG CHI TIẾT

### 4.1. Website bán hàng (dành cho khách hàng)

| # | Tính năng | Mô tả chi tiết | Trạng thái |
|---|---|---|---|
| 1 | **Trang chủ thương hiệu** | Hero "sơn mài & vàng lá", chuyên mục, sản phẩm nổi bật, mục "Cách mua & tải" | ✅ |
| 2 | **Bộ sưu tập** | Lưới sản phẩm, **lọc theo chuyên mục**, **tìm kiếm theo tên**, **sắp xếp** (mới nhất/giá), responsive 2–4 cột | ✅ |
| 3 | **Trang chi tiết bản vẽ** | Nhiều ảnh xem trước, giá, định dạng, dung lượng, thông số kỹ thuật, giấy phép, ghi chú | ✅ |
| 4 | **Giỏ hàng** | Thêm/bớt sản phẩm (mỗi bản vẽ 1 bản — tự tránh trùng), xem tổng tiền | ✅ |
| 5 | **Mua ngay** | Mua 1 sản phẩm ngay lập tức, bỏ qua giỏ hàng → thẳng tới thanh toán | ✅ |
| 6 | **Thanh toán VNPay** | Chuyển sang cổng VNPay, thẻ nội địa/QR, **IPN tự cập nhật trạng thái đơn**, verify chữ ký, trang kết quả thanh toán | ✅ |
| 7 | **Đăng ký / Đăng nhập** | Email + mật khẩu (tối thiểu 8 ký tự, băm bằng bcrypt), nhớ phiên (JWT) | ✅ |
| 8 | **Đăng nhập Google** | Nút "Tiếp tục với Google" (OAuth) — tự tạo tài khoản khách lần đầu, lấy tên + ảnh đại diện | ✅ |
| 9 | **Thư viện của tôi** | Danh sách **file đã mua** theo đơn, **tìm kiếm + lọc chuyên mục**, nút tải file | ✅ |
| 10 | **Nút Tải về thông minh** | Trang bản vẽ đã mua hiện **nút "Tải về file đã mua"** thay cho nút mua; bị thu hồi thì hiển thông báo liên hệ admin | ✅ |
| 11 | **Tải file an toàn** | Chỉ đúng tài khoản đã mua + đơn đã thanh toán + chưa bị thu hồi mới tải được; file gửi qua **URL ký tạm R2** (không lộ file gốc) | ✅ |
| 12 | **Tài khoản cá nhân** | Xem thông tin, đăng xuất | ✅ |
| 13 | **Trang thông tin** | Hướng dẫn sử dụng, Câu hỏi thường gặp (FAQ), Giấy phép bản vẽ, Liên hệ | ✅ |
| 14 | **Giao diện** | Chế độ **sáng/tối**, **tối ưu di động**, font tiếng Việt, hoàn toàn responsive | ✅ |
| 15 | **SEO** | Metadata từng trang, sitemap.xml tự động | ✅ |

### 4.2. Khu quản trị Admin (dành cho chủ shop)

| # | Tính năng | Mô tả chi tiết | Trạng thái |
|---|---|---|---|
| 16 | **Dashboard tổng quan** | Doanh thu đã thu, tổng đơn, đơn chờ xử lý, số sản phẩm, số khách, lượt tải; **biểu đồ doanh thu 14 ngày**, **tình trạng đơn hàng**, **top sản phẩm bán chạy**, **đơn gần nhất** | ✅ |
| 17 | **Quản lý sản phẩm** | Thêm/sửa/xóa; upload file bản vẽ lên R2; **1–nhiều ảnh minh họa** (xem trước, thêm/xóa từng ảnh); ẩn/hiện nhanh; thể hiện ảnh thumbnail; tìm kiếm + lọc + phân trang | ✅ |
| 18 | **Quản lý đơn hàng** | Lọc theo trạng thái, tìm theo mã đơn, phân trang, xem chi tiết, **đổi trạng thái thủ công** (dùng khi khách đã chuyển khoản nhưng IPN chưa về) | ✅ |
| 19 | **Thu hồi / hủy thu hồi** | **Thu hồi quyền tải theo từng sản phẩm trong đơn** (hết hiệu lực tải ngay); hủy thu hồi để khôi phục | ✅ |
| 20 | **Quản lý chuyên mục** | Thêm/sửa/xóa; thứ tự hiển thị; **chặn xóa khi còn sản phẩm** (tránh mất dữ liệu) | ✅ |
| 21 | **Quản lý khách hàng** | Danh sách khách: số đơn, số đơn đã thanh toán, **tổng chi tiêu**; **xem toàn bộ đơn của từng khách** | ✅ |
| 22 | **Lịch sử tải file** | 100 lượt tải gần nhất: ai, file nào, đơn nào, IP, thời gian — phục vụ kiểm tra vi phạm | ✅ |
| 23 | **Phân quyền Admin** | Mọi trang/action admin đều kiểm tra vai trò ADMIN — khách thường không truy cập được | ✅ |
| 24 | **Phòng ngừa xóa nhầm** | Sản phẩm đã nằm trong đơn hàng không bị xóa cứng — chỉ ẩn (giữ lịch sử bán hàng) | ✅ |

### 4.3. Hạ tầng & kỹ thuật

| # | Hạng mục | Mô tả | Trạng thái |
|---|---|---|---|
| 25 | Thanh toán VNPay sandbox | Tích hợp hoàn chỉnh + **script tự kiểm tra 7/7 hạng mục** + E2E bằng thẻ test NCB | ✅ |
| 26 | Chống tải file trái phép | File không public; chỉ phát hành qua URL ký tạm có thời hạn; ghi log mỗi lượt tải | ✅ |
| 27 | Bảo mật mật khẩu | bcrypt + session JWT ký bằng AUTH_SECRET | ✅ |
| 28 | Chống SQL/NoSQL injection, XSS | Sử dụng query tham số hóa (Mongoose), regex tìm kiếm được escape | ✅ |
| 29 | Script hỗ trợ vận hành | Kiểm tra DB, seed dữ liệu mẫu, tự kiểm tra VNPay, kiểm tra SSR toàn bộ trang admin (13/13 PASS), kiểm tra luồng thu hồi | ✅ |
| 30 | Môi trường chính thức (production VNPay) | Đăng ký merchant VNPay thật + bật HTTPS + domain → **bước cuối trước khi kinh doanh** | ⏳ Chờ khách cung cấp |

---

## 5. HƯỚNG DẪN SỬ DỤNG HỆ THỐNG

### 5.1. Phía khách hàng mua bản vẽ

**Bước 1 — Duyệt sản phẩm**
- Vào **Bộ sưu tập** → chọn chuyên mục / gõ từ khóa / sắp xếp theo ý muốn.
- Bấm vào bản vẽ → xem ảnh, giá, định dạng, thông số kỹ thuật.

**Bước 2 — Mua**
- Cách A: bấm **"Thêm vào giỏ"** → vào **Giỏ hàng** → **"Tiến hành thanh toán"**.
- Cách B: bấm **"Mua ngay"** → tạo đơn luôn, không qua giỏ.

**Bước 3 — Tài khoản & thanh toán**
- Chưa đăng nhập → hệ thống đưa sang **Đăng nhập** (email/mật khẩu **hoặc nút Google**).
- Tại trang thanh toán → bấm nút thanh toán → chuyển sang **cổng VNPay** → chọn thẻ ngân hàng nội địa hoặc QR → nhập thông tin → xác nhận.

**Bước 4 — Nhận file**
- Thanh toán thành công → tự động về **Thư viện của tôi**.
- File tải về bất cứ lúc nào, trên mọi thiết bị: bấm **"Tải file"**.
- Quay lại bất kỳ trang bản vẽ đã mua nào cũng thấy nút **"Tải về file đã mua"**.

> Lưu ý: nếu hệ thống chưa chuyển trạng thái đơn vì lỗi mạng (đơn hiện "Chờ thanh toán" dù khách đã trả tiền), khách **liên hệ shop** — admin xác nhận và đánh dấu đã thanh toán trong 1 phút (Mục 6.3).

### 5.2. Phía Admin

**Đăng nhập quản trị:** vào `/admin` bằng tài khoản Admin (email + mật khẩu đã cấu hình) → sidebar quản trị.

**Hằng ngày nên xem:** Dashboard → Doanh thu / Đơn chờ xử lý / Đơn gần nhất.

**Thao tác hay dùng:**
| Nghiệp vụ | Làm ở đâu | Cách làm |
|---|---|---|
| Đăng sản phẩm mới | Sản phẩm → + Thêm sản phẩm | Nhập tiêu đề, chuyên mục, giá, định dạng, upload file bản vẽ, thêm 1–nhiều ảnh (preview), thông số → Lưu |
| Ẩn sản phẩm tạm thời | Sản phẩm → bấm **"Ẩn"** | Hiện lại bằng nút **"Hiện"** |
| Xác nhận đơn đã thanh toán thủ công | Đơn hàng → tìm mã → Chi tiết → **"Đánh dấu đã thanh toán"** | Dùng khi IPN chưa chạy |
| Hủy đơn / đánh dấu thất bại | Đơn hàng → Chi tiết đơn → nút tương ứng | |
| Thu hồi bản vẽ khỏi khách | Đơn hàng → Chi tiết đơn → nút **"Thu hồi"** ở từng sản phẩm | Khách mất quyền tải ngay; **"Hủy thu hồi"** để khôi phục |
| Thêm chuyên mục | Chuyên mục → + Thêm chuyên mục | Tên + slug (đường dẫn) + thứ tự |
| Xem khách hàng VIP | Khách hàng → bấm tên khách | Xem tổng chi + toàn bộ đơn |
| Kiểm tra ai đã tải file | Tải file → bảng 100 lượt gần nhất | Kèm IP, thời gian |

---

## 6. HƯỚNG DẪN VẬN HÀNH

### 6.1. Lịch vận hành định kỳ

| Tần suất | Việc cần làm |
|---|---|
| **Hàng ngày (5 phút)** | Kiểm tra Dashboard: đơn chờ xử lý, đơn mới; kiểm tra email zin liên hệ; đăng sản phẩm mới nếu có |
| **Hàng tuần (15 phút)** | Rà lại **đơn PENDING** quá 24h (khách có thể đã chuyển khoản ngoài luồng) → đối chiếu sao kê → đánh dấu thủ công; kiểm tra lịch sử tải có dấu hiệu lạ |
| **Hàng tháng (30 phút)** | Xuất báo cáo doanh thu từ Dashboard; kiểm tra dung lượng ổ đĩa VPS (file bản vẽ + DB); kiểm tra phiên backup tự động; rà bảng giá/khuyến mãi |

### 6.2. Quy trình xử lý "khách đã trả tiền nhưng đơn vẫn chờ"
1. Khách báo đã chuyển khoản qua VNPay nhưng chưa nhận file → admin vào **Đơn hàng → Chi tiết**.
2. Đối chiếu mã đơn + số tiền với sao kê VNPay.
3. Bấm **"Đánh dấu đã thanh toán"** → khách nhận quyền tải ngay.
> Trường hợp này hiếm (sandbox/IPN chạy ổn định) nhưng quy trình xử lý nhanh, khách không phải chờ lâu.

### 6.3. Quy trình thu hồi bản vẽ (khi khách vi phạm giấy phép / hoàn trả)
1. Admin vào **Đơn hàng → Chi tiết**.
2. Tại sản phẩm vi phạm bấm **"Thu hồi"**.
3. Khách lập tức **mất nút tải** ở cả trang bản vẽ lẫn Thư viện; đường tải cũ bị chặn (403).
4. Muốn khôi phục (khách đã khắc phục) → bấm **"Hủy thu hồi"**.

### 6.4. Sao lưu & phục hồi (phương án 1 VPS)
- **MongoDB (Docker trên VPS)**: bên triển khai cài sẵn **job sao lưu tự động** (mongodump chạy cron hằng đêm, giữ 7 phiên bản gần nhất) — khôi phục bằng 1 lệnh khi cần.
- **File bản vẽ + ảnh (MinIO)**: đồng bộ volume MinIO sang thư mục backup trên VPS hoặc tải về máy local (khuyến nghị tháng/lần, nhất là khi bộ sưu tập lớn).
- **Mật khẩu/quyền**: quên mật khẩu admin → đổi `ADMIN_PASSWORD` trong `.env`, xóa user admin trong DB, chạy `npm run db:seed`.

### 6.5. Giám sát & sự cố
| Sự cố | Dấu hiệu | Xử lý |
|---|---|---|
| Trang không tải | Server down | Restart ứng dụng trên VPS / kiểm tra log |
| Không thanh toán được | Bấm thanh toán lỗi | Xem log VNPay; kiểm tra `VNPAY_*` trong `.env`, thử script tự kiểm tra: `node scripts/vnpay-selfcheck.mjs` |
| Không kết nối được DB / MinIO | Cảnh báo trong log | `docker compose restart mongo minio` trên VPS (Dokploy); kiểm tra dung lượng ổ đĩa |
| Đơn không chuyển PAID dù khách trả | IPN lỗi | Quy trình 6.2 (đánh dấu thủ công) |

---

## 7. CHI PHÍ ĐẦU TƯ — BẢNG GIÁ THEO TÍNH NĂNG

> ❗ **Lưu ý quan trọng**: bảng giá dưới đây là **mức đề xuất tham khảo** (VNĐ), phục vụ thương lượng. Giá cuối cùng do hai bên thống nhất.

### 7.1. Bảng giá phát triển theo tính năng

| # | Tính năng / hạng mục | Giá đề xuất (VNĐ) |
|---|---|---|
| 1 | Thiết kế giao diện + hệ thống theme sáng/tối + responsive di động | 5.000.000 |
| 2 | Trang chủ thương hiệu (hero, chuyên mục, sản phẩm nổi bật) | 3.000.000 |
| 3 | Bộ sưu tập: lọc chuyên mục, tìm kiếm, sắp xếp | 4.000.000 |
| 4 | Trang chi tiết bản vẽ (nhiều ảnh, thông số kỹ thuật) | 3.000.000 |
| 5 | Giỏ hàng | 2.500.000 |
| 6 | Nút "Mua ngay" (thanh toán 1 sản phẩm, bỏ qua giỏ) | 1.500.000 |
| 7 | Đăng ký / đăng nhập email + mật khẩu + trang tài khoản | 3.500.000 |
| 8 | Đăng nhập Google (OAuth) | 3.000.000 |
| 9 | Tích hợp thanh toán VNPay (cổng, IPN, verify chữ ký, trang kết quả) | 6.000.000 |
| 10 | Thư viện của tôi + tải file qua URL ký tạm R2 + ghi lịch sử tải | 5.000.000 |
| 11 | Nút "Tải về" thông minh khi đã mua + chặn mua lại ngầm | 2.000.000 |
| 12 | Dashboard quản trị (doanh thu 14 ngày, tình trạng đơn, top sản phẩm, đơn gần nhất) | 4.500.000 |
| 13 | Quản lý sản phẩm (upload file R2, 1–nhiều ảnh, ẩn/hiện, tìm kiếm, phân trang) | 5.500.000 |
| 14 | Quản lý đơn hàng (lọc, tìm, chi tiết, đổi trạng thái, xử lý thủ công) | 4.000.000 |
| 15 | Thu hồi / hủy thu hồi quyền tải theo từng sản phẩm | 2.500.000 |
| 16 | Quản lý chuyên mục (CRUD, thứ tự, chặn xóa khi còn sản phẩm) | 2.000.000 |
| 17 | Quản lý khách hàng + xem đơn theo khách + tổng chi tiêu | 3.500.000 |
| 18 | Lịch sử tải file (IP, thời gian, 100 lượt gần nhất) | 2.000.000 |
| 19 | SEO + sitemap + metadata tự động | 2.000.000 |
| 20 | Kiểm thử, bảo mật, tài liệu, bàn giao + bảo hành | 3.000.000 |
| | **TỔNG GIÁ TRỊ THEO GIÁ LẺ** | **68.000.000** |
| | 🎁 **GÓI TRỌN GÓI ƯU ĐÃI (đề xuất)** | **45.000.000** |

> Gói trọn gói bao gồm **toàn bộ 20 hạng mục trên + bảo hành trọn đời (Mục 10)**.

### 7.2. Các khoản KHÔNG nằm trong giá phát triển
- Chi phí **domain, hosting/VPS, tài khoản hạ tầng** (Mục 8).
- **Phí đăng ký & giao dịch VNPay** khi chuyển sang production.
- Chi phí **tính năng mở rộng mới** (Mục 9) — báo giá riêng.

---

## 8. CHI PHÍ VẬN HÀNH ĐỊNH KỲ & PHÂN CHIA GIỮA CÁC BÊN

### 8.1. Bảng chi phí vận hành (phương án tối giản — 1 VPS + tên miền)

| Hạng mục | Nhà cung cấp | Chi phí | Chu kỳ | Ghi chú |
|---|---|---|---|---|
| Tên miền (.com/.vn) | Nhà đăng ký tên miền | ~250.000–400.000 VNĐ | Năm | Chỉ ~20.000–35.000 VNĐ/tháng quy đổi |
| **1 VPS Linux** chạy **Dokploy** | VPS trong nước (Vietnix, AZDIGI, VNG Cloud…) | ~200.000–450.000 VNĐ | Tháng | RAM 2–4GB đủ chạy: app + MongoDB + MinIO + Dokploy/Traefik |
| MongoDB (Docker trên VPS) | Tự cài qua Dokploy | **0 VNĐ** | — | Miễn phí, không lo hạn mức 512MB của Atlas |
| MinIO (S3, Docker trên VPS) | Tự cài qua Dokploy | **0 VNĐ** | — | Lưu file bản vẽ + ảnh ngay trên VPS |
| Giấy chứng nhận SSL | Let's Encrypt (Dokploy cấp tự động) | **0 VNĐ** | — | HTTPS tự động |
| VNPay | VNPay | Phí giao dịch (thường ~0,4–1% mỗi đơn) | Theo giao dịch | Sandbox miễn phí; production có hợp đồng merchant |
| **ƯỚC TỔNG (chưa phí giao dịch VNPay)** | | **~200.000–500.000 VNĐ/tháng** | | **Chỉ 2 khoản: VPS + tên miền** |

> 💡 **So với phương án cũ** (MongoDB Atlas trả phí + Cloudflare R2): với phương án 1 VPS, mọi chi phí ngoài chỉ gồm **VPS + tên miền**. Nhược điểm duy nhất: tự lo backup (đã cài sẵn job sao lưu tự động hằng đêm) và sự cố dồn về 1 máy — phù hợp quy mô shop nhỏ/khởi nghiệp.

### 8.2. Phân bổ trách nhiệm chi phí giữa các bên

| Chi phí | Bên chịu | Lý do |
|---|---|---|
| Tên miền + VPS Dokploy (toàn bộ chi phí hạ tầng) | **Bên thuê (khách hàng)** | Khách sở hữu VPS + domain → làm chủ dữ liệu & code hoàn toàn |
| Phí giao dịch VNPay (theo từng đơn) | **Bên thuê (khách hàng)** | Trích từ doanh thu bán hàng của khách |
| Sửa lỗi, hỗ trợ vận hành, cập nhật bảo mật (trong phạm vi) | **Bên triển khai** | Nằm trong gói bảo hành trọn đời (Mục 10) |
| Tính năng mới / thay đổi nghiệp vụ | **Bên thuê** | Báo giá riêng theo bảng giá Mục 7 / 9 |
| Xử lý sự cố do thao tác sai của bên vận hành | **Bên thuê** (hỗ trợ miễn phí của bên triển khai) | Hướng dẫn + khôi phục được hỗ trợ trong bảo hành |

> **Nguyên tắc:** bên triển khai chịu trách nhiệm **chất lượng phần mềm** (viết đúng, sửa lỗi, bảo trì code, cài đặt & giám sát hạ tầng trong phạm vi bảo hành); bên thuê chịu **chi phí thuê hạ tầng & nội dung kinh doanh** (đăng file, giá bán, marketing…).

---

## 9. TÍNH NĂNG MỞ RỘNG TRONG TƯƠNG LAI

> Hệ thống được thiết kế theo kiến trúc module — các hạng mục dưới đây có thể phát triển **mà không phá vỡ hệ thống hiện tại**. Đây là nguồn doanh thu/cạnh tranh mở rộng cho khách hàng sau khi vận hành ổn định.

### 9.1. Ưu tiên cao (giai đoạn 2 — đề xuất triển khai sau 1–2 tháng vận hành)

| # | Tính năng | Mô tả | Giá ước lượng (VNĐ) |
|---|---|---|---|
| 1 | **Mã giảm giá / khuyến mãi** | Tạo mã giảm % / giảm tiền, thời hạn, số lượt dùng; áp dụng ở giỏ & trang thanh toán | 4.000.000 |
| 2 | **Đăng nhập Facebook / Zalo / GitHub** | Mở rộng OAuth — khách có sẵn tài khoản mạng xã hội là mua được ngay | 3.500.000/nền tảng |
| 3 | **Đánh giá & bình luận sản phẩm** | Khách đã mua được đánh giá sao + nội dung; hiển thị trên trang bản vẽ (tăng độ tin cậy) | 4.000.000 |
| 4 | **Đa định dạng file trong 1 sản phẩm** | 1 bản vẽ có nhiều định dạng (DXF + AI + PDF) đóng gói ZIP khi tải | 4.000.000 |
| 5 | **Xuất hóa đơn / biên nhận** | Hóa đơn điện tử (VAT) hoặc biên nhận PDF tự động cho từng đơn | 3.000.000 |

### 9.2. Ưu tiên trung bình (giai đoạn 3)

| # | Tính năng | Mô tả | Giá ước lượng (VNĐ) |
|---|---|---|---|
| 6 | **Tìm kiếm nâng cao** | Tìm theo kích thước, định dạng, độ phức tạp; gợi ý sản phẩm tương tự | 5.000.000 |
| 7 | **Gói thành viên VIP / thuê bao** | Khách trả gói tháng/năm để tải không giới hạn trong hạn mức — doanh thu định kỳ (nhiều lần thanh toán, quản lý hạn dùng) | 8.000.000 |
| 8 | **Danh sách yêu thích** | Khách lưu bản vẽ để mua sau | 2.000.000 |
| 9 | **Báo cáo phân tích nâng cao** | Funnel mua hàng, doanh thu theo chuyên mục, khách hàng quay lại (CRM nhẹ) | 6.000.000 |
| 10 | **Đa ngôn ngữ (EN/CN)** | Phiên bản tiếng Anh/Trung — nhắm khách nước ngoài | 4.000.000/tuỳ gói |
| 11 | **Blog / kênh marketing nội dung** | Đăng bài SEO giới thiệu họa tiết, hướng dẫn CNC — kéo traffic tự nhiên | 4.000.000 |
| 12 | **Thông báo qua email** | Email xác nhận đơn, tải file, khuyến mãi, khôi phục mật khẩu | 3.000.000 |

### 9.3. Ưu tiên dài hạn (giai đoạn 4 — mở rộng kinh doanh)

| # | Tính năng | Mô tả | Giá ước lượng (VNĐ) |
|---|---|---|---|
| 13 | **Bán hàng đa kênh (Zalo OA, Facebook, TikTok)** | Kết nối fanpage/Zalo OA để khách đặt mua ngay trên mạng xã hội | 8.000.000+ |
| 14 | **Dịch vụ đặt khắc/in theo bản vẽ** | Khách chọn họa tiết + kích thước + chất liệu → shop tự nhận đơn sản xuất (chuyển từ bán file sang bán sản phẩm) | 12.000.000+ |
| 15 | **API mở cho đại lý** | Cấp API cho đại lý/website khác bán hộ bản vẽ (hoa hồng) | 6.000.000 |
| 16 | **Ứng dụng di động (PWA/App)** | Cài như app trên điện thoại, thông báo push | 8.000.000 |
| 17 | **Xem trước 3D / video demo** | Ảnh động xoay họa tiết, video thực tế gia công — tăng tỉ lệ chốt đơn | 3.000.000 |
| 18 | **Tùy biến họa tiết online** | Khách chỉnh kích thước/tỉ lệ/chi tiết ngay trên web rồi mua bản đã tùy chỉnh | 12.000.000+ |

---

## 10. CHÍNH SÁCH BẢO HÀNH TRỌN ĐỜI

### 10.1. Phạm vi bảo hành (được bảo hành — MIỄN PHÍ TRỌN ĐỜI)
1. **Sửa lỗi hệ thống (bug)**: mọi lỗi phát sinh trong các tính năng đã bàn giao được sửa miễn phí, **không giới hạn thời gian**.
2. **Hỗ trợ vận hành**: hướng dẫn thao tác (đăng sản phẩm, xử lý đơn, thu hồi…), gỡ rối khi thao tác nhầm, khôi phục trạng thái.
3. **Cập nhật bảo mật khẩn cấp**: vá lỗ hổng bảo mật nghiêm trọng phát hiện trong mã nguồn đã bàn giao (trong khả năng tương thích với phiên bản đã bàn giao).
4. **Đảm bảo tính năng đúng cam kết**: kiểm tra phiếu yêu cầu (acceptance) khi bàn giao — mọi hạng mục sai/lệch được chỉnh sửa miễn phí.
5. **Hợp tác chuyển giao**: bàn giao toàn bộ mã nguồn + tài liệu + tài khoản — khách hàng **làm chủ dữ liệu và code** của mình.

### 10.2. Điều kiện hưởng bảo hành
1. Khách hàng giữ hạ tầng hoạt động đúng hướng dẫn (thanh toán đúng hạn các chi phí hạ tầng tại Mục 8).
2. Không tự ý sửa mã nguồn phần lõi (hoặc phải thông báo; việc tự sửa có thể gây lỗi ngoài phạm vi bảo hành).
3. Báo lỗi kèm thông tin cần thiết (thời điểm, thao tác, ảnh chụp màn hình) + đường dẫn cần thiết để triển khai gỡ lỗi.

### 10.3. Thời gian phản hồi (cam kết)
| Mức độ | Ví dụ | Phản hồi |
|---|---|---|
| Khẩn cấp | Trang không truy cập được, không thanh toán được | Trong **4 giờ hành chính** (ưu tiên xử lý trước) |
| Bình thường | Lỗi nhỏ, lệch hiển thị, nghi vấn | Trong **1 ngày làm việc** |
| Tư vấn | Hỏi cách vận hành, tính năng | Trong **2 ngày làm việc** |

### 10.4. KHÔNG nằm trong bảo hành
1. **Tính năng mới, thay đổi nghiệp vụ, thay đổi giao diện** (báo giá riêng — Mục 7 & 9).
2. Lỗi do **thao tác sai của bên vận hành** hoặc **mất dữ liệu do không backup** (bên triển khai hỗ trợ khôi phục miễn phí khi có backup).
3. Lỗi **nhà cung cấp thứ 3**: Atlas/R2/VNPay/Google ngừng dịch vụ, thay đổi API, thu phí mới.
4. Chi phí **hạ tầng, domain, phí giao dịch**, giá tăng của nhà cung cấp.
5. Lỗi phát sinh sau khi **nâng cấp phiên bản lớn** do bên khác thực hiện hoặc sau khi **ngừng hợp tác bảo trì theo điều khoản riêng**.
6. Rủi ro kinh doanh: giá bán, tỉ lệ chuyển đổi, doanh thu — phần mềm không cam kết kết quả kinh doanh cụ thể.

> **Tóm lại:** "Bảo hành trọn đời" = **sửa lỗi và hỗ trợ vận hành miễn phí trọn đời** trên những gì đã bàn giao; **không** bao gồm hạ tầng, phí nền tảng và tính năng mới.

---

## 11. BẢO MẬT & AN TOÀN DỮ LIỆU

1. **Mật khẩu**: băm bằng bcrypt (không lưu mật khẩu dạng thô), phiên đăng nhập dùng JWT ký bằng khóa bí mật riêng.
2. **File bản vẽ**: không public; chỉ phát hành qua **URL ký tạm có thời hạn** (presigned — MinIO/R2). Kẻ dò đường dẫn không thể tải được file.
3. **Phân quyền**: chỉ admin mới vào được khu quản trị; chỉ đúng tài khoản đã mua + đơn PAID + chưa thu hồi mới tải file.
4. **Tấn công web**: input được kiểm tra (zod), query tham số hóa, regex tìm kiếm escape, HTTPS (Let's Encrypt) khi lên production.
5. **CSRF/SSRF**: Auth.js có cơ chế CSRF token mặc định; thanh toán verify chữ ký HMAC-SHA512 từ VNPay (không tin dữ liệu gửi không đúng chữ ký).
6. **Dữ liệu**: dữ liệu thuộc về khách hàng — bàn giao toàn bộ DB/file code khi kết thúc.

---

## 12. QUY TRÌNH BÀN GIAO

| Bước | Nội dung | Đơn vị thực hiện |
|---|---|---|
| 1 | Kiểm thử nghiệm thu (chạy thử toàn bộ luồng mua — thanh toán — tải) | Hai bên |
| 2 | Khách cung cấp: **1 VPS Linux + tên miền** (đăng ký tài khoản VPS trong nước), tài khoản **VNPay production** (hợp đồng merchant); hoặc bên triển khai đặt VPS giúp | Khách hàng |
| 3 | Bên triển khai: cài **Dokploy** lên VPS → deploy app + MongoDB + MinIO → cấu hình HTTPS/Let's Encrypt + env (VNPay thật) → chạy kiểm thử đầy đủ | Bên triển khai |
| 4 | Đổ dữ liệu thật (bộ sưu tập bản vẽ + chuyên mục + giá), tạo tài khoản admin | Hai bên (nội dung do khách cung cấp) |
| 5 | Đào tạo vận hành (2 buổi online hoặc video hướng dẫn) + bàn giao tài liệu + mã nguồn | Bên triển khai |
| 6 | Ký biên bản nghiệm thu + kích hoạt chính sách bảo hành trọn đời | Hai bên |

---

## 13. CÂU HỎI THƯỜNG GẶP (FAQ)

**Q1: Dữ liệu (file bản vẽ, khách hàng) có thuộc về tôi không?**
→ Có toàn bộ. Bạn sở hữu VPS + tên miền (được bàn giao toàn quyền), dữ liệu nằm trong máy của bạn; mã nguồn được bàn giao đầy đủ.

**Q2: Nếu sau này tôi muốn thêm cổng thanh toán MoMo / ZaloPay thì sao?**
→ Kiến trúc đã tách tầng thanh toán — thêm cổng mới là phát triển thêm theo bảng giá (ước ~4–6 triệu/cổng), không phải làm lại hệ thống.

**Q3: Tôi không rành kỹ thuật, bảo trì thế nào?**
→ Bạn chỉ cần thao tác UI admin (đăng sản phẩm, duyệt đơn). Toàn bộ kỹ thuật nằm trong bảo hành trọn đời — gặp lỗi cứ báo, chúng tôi xử lý.

**Q4: Hệ thống có bán được ra nước ngoài không?**
→ Có thể; tiền tệ đang là VNĐ + VNPay (nội địa). Muốn bán quốc tế: thêm thanh toán quốc tế và đa ngôn ngữ (Mục 9.2).

**Q5: Thời gian tối đa nhận file sau khi thanh toán?**
→ Tự động ngay trong vài giây sau khi VNPay xác nhận (IPN). Cực hiếm trường hợp IPN trễ → đánh dấu thủ công trong 1 phút.

**Q6: Chi phí vận hành tối thiểu mỗi tháng là bao nhiêu?**
→ Chỉ cần **1 VPS (khoảng 200.000–450.000 VNĐ/tháng) + tên miền (~30.000 VNĐ/tháng quy đổi)** — mọi thứ khác (MongoDB, lưu file, SSL) chạy ngay trên VPS qua Dokploy, miễn phí. Tổng ~**200.000–500.000 VNĐ/tháng**, cộng phí giao dịch VNPay theo từng đơn.

---

*Tài liệu được biên soạn dựa trên hiện trạng hệ thống đang vận hành tại thời điểm báo cáo. Mọi giá trị chi phí là mức đề xuất tham khảo, có thể thương lượng. Chi tiết kỹ thuật đầy đủ nằm trong tài liệu README của mã nguồn.*

**— HẾT BÁO CÁO —**