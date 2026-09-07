import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dang-nhap?next=/admin");

  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:py-8">
      <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-8">
        {/* Sidebar (desktop) / tabs (mobile) */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4 hidden lg:block">
            <p className="text-xs uppercase tracking-[0.22em] text-gold">Quản trị</p>
            <h1 className="mt-1 font-display text-xl font-medium">Bảng điều khiển</h1>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-2 lg:p-3">
            <AdminNav />
          </div>
          <div className="mt-3 hidden items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{session.user.name ?? session.user.email}</p>
              <p className="truncate text-xs text-foreground/50">{session.user.email}</p>
            </div>
            <Link
              href="/"
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:border-accent hover:text-accent"
            >
              Xem web →
            </Link>
          </div>
        </aside>

        {/* Nội dung */}
        <main className="mt-4 min-w-0 lg:mt-0">{children}</main>
      </div>
    </div>
  );
}