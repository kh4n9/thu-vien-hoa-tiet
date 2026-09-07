"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readCartCookie, writeCartCookie } from "@/lib/cart-client";

export function AddToCart({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function add() {
    const items = readCartCookie();
    // File số: mỗi sản phẩm chỉ 1 bản — thêm lại không tăng số lượng.
    if (!items.find((i) => i.id === productId)) {
      items.push({ id: productId, qty: 1 });
      writeCartCookie(items);
    }
    setAdded(true);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={add}
      className={
        className ??
        "h-12 flex-1 rounded-full bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
      }
    >
      {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ"}
    </button>
  );
}