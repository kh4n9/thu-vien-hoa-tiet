"use client";

import { useState, useTransition } from "react";
import { createPayment } from "@/lib/actions/checkout";

export function CheckoutButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createPayment();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={pending}
        className="h-12 w-full rounded-full bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Đang chuyển đến VNPay…" : "Thanh toán qua VNPay"}
      </button>
      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  );
}
