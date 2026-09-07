"use client";

import { useActionState } from "react";
import { deleteCategory } from "@/lib/actions/admin";

export function CategoryDeleteButton({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      if (!confirm(`Xóa chuyên mục "${name}"?`)) return _prev;
      const result = await deleteCategory(formData);
      return result ?? {};
    },
    {},
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      {state?.error ? (
        <p className="mb-2 max-w-xs text-xs font-medium text-accent">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-60"
      >
        {pending ? "Đang xóa…" : "Xóa"}
      </button>
    </form>
  );
}