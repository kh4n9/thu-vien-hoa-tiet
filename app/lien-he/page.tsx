export default function LienHe() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">Liên hệ</h1>
      <p className="mt-3 text-foreground/70">
        Cần hỗ trợ về đơn hàng, file bị lỗi hoặc đặt bản vẽ theo yêu cầu? Gửi thông tin cho
        chúng tôi qua email dưới đây.
      </p>
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-line bg-surface px-5 py-4">
          <p className="text-sm text-foreground/50">Email hỗ trợ</p>
          <a
            href="mailto:hotro@thuvienhoatiet.vn"
            className="mt-1 inline-block font-semibold text-accent hover:underline"
          >
            hotro@thuvienhoatiet.vn
          </a>
        </div>
        <div className="rounded-xl border border-line bg-surface px-5 py-4">
          <p className="text-sm text-foreground/50">Thời gian phản hồi</p>
          <p className="mt-1 font-medium">Trong vòng 24 giờ làm việc.</p>
        </div>
      </div>
    </div>
  );
}
