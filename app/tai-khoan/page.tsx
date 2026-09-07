import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?next=/tai-khoan");

  const user = session.user;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-medium tracking-tight">Tài khoản</h1>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-foreground/50">Tên</p>
          <p className="font-semibold">{user.name ?? "—"}</p>
          <p className="mt-3 text-sm text-foreground/50">Email</p>
          <p className="font-semibold">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/thu-vien"
            className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <p className="text-sm text-foreground/50">Thư viện của tôi</p>
            <p className="mt-1 font-semibold">Tải file đã mua</p>
          </Link>
          <Link
            href="/gio-hang"
            className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <p className="text-sm text-foreground/50">Giỏ hàng</p>
            <p className="mt-1 font-semibold">Xem và thanh toán</p>
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
            >
              <p className="text-sm text-foreground/50">Quản trị</p>
              <p className="mt-1 font-semibold">Sản phẩm, đơn hàng</p>
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}