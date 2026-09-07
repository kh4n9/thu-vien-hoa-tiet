"use client";

import { useRouter } from "next/navigation";
import { readCartCookie, writeCartCookie } from "@/lib/cart-client";

/** Điều khiển dòng sản phẩm trong giỏ — file số nên mỗi loại luôn 1 bản, chỉ có Xóa. */
export function CartControls({ productId }: { productId: string }) {
  const router = useRouter();

  function remove() {
    const items = readCartCookie().filter((i) => i.id !== productId);
    writeCartCookie(items);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <span className="text-xs text-foreground/50">1 bản</span>
      <button
        type="button"
        onClick={remove}
        className="text-sm text-foreground/50 underline-offset-2 hover:text-accent hover:underline"
      >
        Xóa
      </button>
    </div>
  );
}