export default function HuongDan() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">Hướng dẫn sử dụng</h1>
      <div className="mt-8 space-y-8 text-foreground/75">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">1. Tạo tài khoản</h2>
          <p>Đăng ký bằng email và mật khẩu. Tài khoản giúp bạn lưu lại các file đã mua trong Thư viện.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">2. Chọn họa tiết</h2>
          <p>
            Duyệt theo chuyên mục hoặc tìm kiếm tên họa tiết. Xem chi tiết về định dạng file,
            thông số kỹ thuật và ảnh xem trước trước khi mua.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">3. Thanh toán</h2>
          <p>
            Thêm sản phẩm vào giỏ, tiến hành thanh toán trực tuyến qua cổng VNPay. Sau khi
            thanh toán thành công, đơn hàng được ghi nhận ngay lập tức.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">4. Tải file</h2>
          <p>
            Vào mục <span className="font-semibold">Thư viện</span> trong tài khoản, chọn đơn
            hàng đã thanh toán và nhấn tải. File sẽ được tải về từ máy chủ an toàn.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">5. Sử dụng file</h2>
          <p>
            Tùy định dạng bạn có thể mở bằng phần mềm tương ứng (AutoCAD/DXF, Illustrator/AI,
            PDF…). Xem chi tiết giấy phép tại trang{" "}
            <span className="font-semibold">Giấy phép sử dụng</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
