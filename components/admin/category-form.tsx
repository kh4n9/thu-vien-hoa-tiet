"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { CategoryFormState } from "@/lib/actions/admin";

type Props = {
  action: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  initial?: { id?: string; name?: string; slug?: string; description?: string; order?: number };
  submitLabel: string;
  cancelHref: string;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-accent";

export function CategoryForm({ action, initial, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {state?.error && (
        <p className="rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="cat-name">
            Tên chuyên mục
          </label>
          <input
            id="cat-name"
            name="name"
            type="text"
            required
            defaultValue={initial?.name}
            placeholder="VD: Hoa sen"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="cat-slug">
            Slug (đường dẫn)
          </label>
          <input
            id="cat-slug"
            name="slug"
            type="text"
            required
            defaultValue={initial?.slug}
            placeholder="VD: hoa-sen"
            className={`${fieldClass} font-mono text-sm`}
          />
          <p className="text-xs text-foreground/45">Chữ thường, số và dấu gạch ngang, bỏ dấu.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="cat-desc">
          Mô tả
        </label>
        <textarea
          id="cat-desc"
          name="description"
          rows={3}
          defaultValue={initial?.description}
          placeholder="Mô tả ngắn về chuyên mục…"
          className="w-full rounded-xl border border-line bg-background px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="cat-order">
          Thứ tự hiển thị
        </label>
        <input
          id="cat-order"
          name="order"
          type="number"
          min={0}
          defaultValue={initial?.order ?? 0}
          className={fieldClass}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-accent px-7 font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Đang xử lý…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-6 text-sm font-medium transition-colors hover:bg-line/40"
        >
          Hủy
        </Link>
      </div>
    </form>
  );
}