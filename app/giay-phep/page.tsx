export default function GiayPhep() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">Giấy phép sử dụng</h1>
      <div className="mt-8 space-y-6 text-foreground/75">
        <p>
          Khi mua một bản vẽ trên Thư viện Họa Tiết, bạn được cấp{" "}
          <span className="font-semibold text-foreground">giấy phép sử dụng thương mại</span>{" "}
          đối với file đó. Vui lòng đọc kỹ các điều khoản dưới đây.
        </p>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Bạn được phép</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Sử dụng file để sản xuất, khắc, cắt, in sản phẩm cho khách hàng.</li>
            <li>Chỉnh sửa file theo nhu cầu của dự án.</li>
            <li>Dùng không giới hạn số lượng sản phẩm cho một dự án.</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Bạn không được phép</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tái bán, chia sẻ, phát tán file gốc hoặc bản đã chỉnh sửa cho bên thứ ba.</li>
            <li>Đăng tải file dưới dạng tải về được trên các nền tảng khác.</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Quyền sở hữu</h2>
          <p>
            Quyền sở hữu trí tuệ đối với thiết kế thuộc về Thư viện Họa Tiết. Bạn chỉ được cấp
            quyền sử dụng theo giấy phép nêu trên.
          </p>
        </section>
      </div>
    </div>
  );
}
