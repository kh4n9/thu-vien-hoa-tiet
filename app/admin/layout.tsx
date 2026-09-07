import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dang-nhap");

  const nav = [
    { href: "/admin", label: "Tổng quan" },
    { href: "/admin/san-pham", label: "Sản phẩm" },
    { href: "/admin/don-hang", label: "Đơn hàng" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Quản trị</h1>
        <nav className="flex flex-wrap gap-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-foreground/50 hover:text-accent"
          >
            Xem web →
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}