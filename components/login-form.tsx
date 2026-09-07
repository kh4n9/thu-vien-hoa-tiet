"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleSignInButton, OAuthDivider } from "@/components/oauth-buttons";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    setPending(false);

    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    router.push(next ?? "/");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Tài khoản</p>
        <h1 className="mt-2 font-display text-2xl font-medium tracking-tight">Đăng nhập</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Đăng nhập để thanh toán và tải file trong Thư viện.
        </p>

        <div className="mt-6">
          <GoogleSignInButton callbackUrl="/" />
          <OAuthDivider />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent">
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-gold"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full bg-accent font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {pending ? "Đang xử lý…" : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="font-semibold text-accent hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}