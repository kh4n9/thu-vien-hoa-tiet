"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ProductFormState } from "@/lib/actions/admin";

type Category = { id: string; name: string };

type ProductFormProps = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  initial?: {
    id?: string;
    title?: string;
    description?: string;
    price?: number;
    format?: string;
    categoryId?: string;
    specs?: string;
    license?: string;
    isActive?: boolean;
  };
  submitLabel: string;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-accent";
const labelClass = "text-sm font-medium";

export function ProductForm({ action, categories, initial, submitLabel }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {state?.error && (
        <p className="rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelClass} htmlFor="title">
            Tiêu đề
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={initial?.title}
            placeholder="VD: Hoa sen cách điệu phiên bản CNC"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="categoryId">
            Chuyên mục
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initial?.categoryId}
            className={fieldClass}
          >
            <option value="">Chọn chuyên mục…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="price">
              Giá (VND)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={1000}
              step={1000}
              required
              defaultValue={initial?.price}
              placeholder="VD: 150000"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="format">
              Định dạng
            </label>
            <input
              id="format"
              name="format"
              type="text"
              required
              defaultValue={initial?.format}
              placeholder="VD: DXF"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="description">
          Mô tả
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={initial?.description}
          placeholder="Mô tả họa tiết, kích thước, ứng dụng…"
          className="w-full rounded-xl border border-line bg-background px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="file">
            File bản vẽ {!initial?.id && <span className="text-accent">*</span>}
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required={!initial?.id}
            className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent/20"
          />
          {initial?.id && (
            <p className="text-xs text-foreground/50">Bỏ trống nếu muốn giữ file hiện tại.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="images">
            Ảnh xem trước (nhiều ảnh)
          </label>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent/20"
          />
          {initial?.id && (
            <p className="text-xs text-foreground/50">Chọn ảnh mới nếu muốn thay thế bộ ảnh hiện tại.</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="specs">
            Thông số kỹ thuật (JSON)
          </label>
          <textarea
            id="specs"
            name="specs"
            rows={4}
            defaultValue={initial?.specs}
            placeholder='{"Kích thước":"600 × 600 mm","Độ phân giải":"Vector"}'
            className="w-full rounded-xl border border-line bg-background px-4 py-3 font-mono text-xs outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="license">
            Giấy phép / ghi chú
          </label>
          <textarea
            id="license"
            name="license"
            rows={4}
            defaultValue={initial?.license}
            placeholder="Mô tả ngắn về giấy phép hoặc ghi chú thêm…"
            className="w-full rounded-xl border border-line bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial?.isActive ?? true}
          className="h-4 w-4 rounded border-line accent-[var(--accent)]"
        />
        Hiển thị công khai
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-accent px-7 font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Đang xử lý…" : submitLabel}
        </button>
        <Link
          href="/admin/san-pham"
          className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-6 text-sm font-medium transition-colors hover:bg-line/40"
        >
          Hủy
        </Link>
      </div>
    </form>
  );
}