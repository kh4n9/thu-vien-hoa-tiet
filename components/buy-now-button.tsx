"use client";

import { useEffect, useState, useTransition } from "react";
import { buyNow } from "@/lib/actions/checkout";

/** "Mua ngay" — tạo đơn 1 sản phẩm rồi chuyển thẳng tới VNPay, không qua giỏ hàng. */
export function BuyNowButton({ productId, next }: { productId: string; next: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) window.location.href = url;
  }, [url]);

  function handle() {
    setError(null);
    startTransition(async () => {
      const res = await buyNow({ productId, next });
      if ("url" in res) {
        setUrl(res.url);
      } else {
        setError(res.error ?? "Không thể thanh toán ngay. Vui lòng thử lại.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Đang tạo đơn…" : "Mua ngay"}
      </button>
      {error && <p className="text-xs font-medium text-accent">{error}</p>}
    </div>
  );
}