"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-11 items-center rounded-full border border-line px-6 text-sm font-semibold text-accent transition-colors hover:bg-line/40"
    >
      Đăng xuất
    </button>
  );
}
