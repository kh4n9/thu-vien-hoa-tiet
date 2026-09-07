import Link from "next/link";
import { Motif, MotifDivider } from "@/components/motif";

export function SiteFooter() {
  return (
    <footer className="texture-lacquer border-t border-ivory/10">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <MotifDivider className="mb-12 max-w-md mx-auto" />

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Motif className="h-8 w-8" />
              <span className="font-display text-lg text-ivory">Thư viện Họa Tiết</span>
            </div>
            <p className="text-sm leading-relaxed text-ivory/55">
              Kho bản vẽ kỹ thuật họa tiết cổ truyền Á Đông — cho CNC, khắc gỗ, laser và thêu mỹ nghệ.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Khám phá</h3>
            <ul className="space-y-2 text-sm text-ivory/65">
              <li><Link className="transition-colors hover:text-gold" href="/bo-suu-tap">Bộ sưu tập</Link></li>
              <li><Link className="transition-colors hover:text-gold" href="/huong-dan">Hướng dẫn sử dụng</Link></li>
              <li><Link className="transition-colors hover:text-gold" href="/gio-hang">Giỏ hàng</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-ivory/65">
              <li><Link className="transition-colors hover:text-gold" href="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link className="transition-colors hover:text-gold" href="/giay-phep">Giấy phép sử dụng</Link></li>
              <li><Link className="transition-colors hover:text-gold" href="/lien-he">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Thanh toán</h3>
            <p className="text-sm leading-relaxed text-ivory/55">
              Thanh toán qua VNPay. File có ngay trong Thư viện của bạn sau khi giao dịch thành công.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-ivory/10 pt-6 text-xs text-ivory/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Thư viện Họa Tiết. Mọi quyền được bảo lưu.</span>
          <span className="uppercase tracking-[0.25em]">Sơn mài · Vàng lá · Họa tiết</span>
        </div>
      </div>
    </footer>
  );
}
