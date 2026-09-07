import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { parseCart, cartTotalItems } from "@/lib/cart";
import { ThemeToggle } from "@/components/theme-toggle";
import { Motif } from "@/components/motif";

export async function SiteHeader() {
  const session = await auth();
  const cookieStore = await cookies();
  const cartCount = cartTotalItems(parseCart(cookieStore.get("cart")?.value));

  return (
    <header className="sticky top-0 z-40 border-b border-lacquer-line/60 bg-lacquer-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="group flex items-center gap-3">
          <Motif className="h-9 w-9 transition-transform duration-500 group-hover:rotate-45" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-medium tracking-tight text-lacquer-fg">
              Thư viện Họa Tiết
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-gold">
              Bản vẽ kỹ thuật trang trí
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-lacquer-soft md:flex">
          <Link className="transition-colors hover:text-gold" href="/bo-suu-tap">
            Bộ sưu tập
          </Link>
          <Link className="transition-colors hover:text-gold" href="/huong-dan">
            Hướng dẫn
          </Link>
          <Link className="transition-colors hover:text-gold" href="/faq">
            Câu hỏi
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-lacquer-fg/25 text-lacquer-fg transition-colors hover:border-gold hover:text-gold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-1.5">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-gold transition-colors hover:bg-lacquer-line/40 sm:inline-flex"
                >
                  Quản trị
                </Link>
              )}
              <Link
                href="/thu-vien"
                className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-gold transition-colors hover:bg-lacquer-line/40 md:inline-flex"
              >
                Thư viện
              </Link>
              <Link
                href="/tai-khoan"
                className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
              >
                {session.user.name?.split(" ").slice(-1)[0] ?? "Tài khoản"}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dang-nhap"
                className="inline-flex h-9 items-center rounded-full border border-lacquer-fg/25 px-4 text-sm font-medium text-lacquer-fg transition-colors hover:border-gold hover:text-gold"
              >
                Đăng nhập
              </Link>
              <Link
                href="/dang-ky"
                className="hidden h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong sm:inline-flex"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
