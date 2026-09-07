"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/lib/actions/admin";

export function DeleteProductButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        if (!confirm(`Xóa sản phẩm "${title}"?`)) return;
        startTransition(() => deleteProduct(formData));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-60"
      >
        {isPending ? "Đang xóa…" : "Xóa"}
      </button>
    </form>
  );
}