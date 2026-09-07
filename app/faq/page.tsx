export default function Faq() {
  const faqs = [
    {
      q: "Sau khi thanh toán, tôi tải file ở đâu?",
      a: "Vào mục Thư viện trong tài khoản của bạn. Mọi đơn hàng đã thanh toán sẽ liệt kê các file kèm nút tải xuống.",
    },
    {
      q: "File có thể dùng cho CNC / laser / in được không?",
      a: "Tùy vào định dạng bạn mua: DXF/DWG dùng cho CNC và laser, AI cho thiết kế vector, PDF dễ in và xem trước.",
    },
    {
      q: "Tôi có thể mua mà không cần đăng ký không?",
      a: "Bạn cần có tài khoản để lưu trữ và tải lại file đã mua bất cứ lúc nào.",
    },
    {
      q: "Thanh toán có an toàn không?",
      a: "Chúng tôi dùng cổng thanh toán VNPay — một trong những cổng thanh toán phổ biến và được bảo mật tại Việt Nam.",
    },
    {
      q: "Tôi có được hoàn tiền không?",
      a: "Vì đây là sản phẩm số, sau khi tải file chúng tôi không hoàn tiền. Tuy nhiên nếu file bị lỗi hoặc không mở được, liên hệ chúng tôi để được hỗ trợ.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">Câu hỏi thường gặp</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-xl border border-line bg-surface px-5 py-4">
            <summary className="cursor-pointer list-none font-semibold transition-colors group-open:text-accent">
              {f.q}
            </summary>
            <p className="mt-3 leading-relaxed text-foreground/70">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
