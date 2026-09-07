"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type RegisterState } from "@/lib/actions/auth";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl font-medium tracking-tight">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Tạo tài khoản để thanh toán và tải file trong Thư viện.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {state?.error && (
            <p className="rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent">
              {state.error}
            </p>
          )}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Tên của bạn
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="VD: Nguyễn Văn A"
              className="h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>
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
              className="h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-accent"
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
              minLength={8}
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
              className="h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full bg-accent font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {pending ? "Đang xử lý…" : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" className="font-semibold text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}