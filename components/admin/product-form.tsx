"use client";

import { useActionState, useRef, useState } from "react";
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
    /** Khóa ảnh minh họa hiện có (hiển thị để giữ / xóa từng ảnh). */
    images?: string[];
  };
  submitLabel: string;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-accent";
const labelClass = "text-sm font-medium";

export function ProductForm({ action, categories, initial, submitLabel }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([]);
  const [removedKeys, setRemovedKeys] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingImages = initial?.images ?? [];

  function onPickImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    setNewPreviews(files.map((f) => ({ file: f, url: URL.createObjectURL(f) })));
  }

  function removeNewImage(index: number) {
    setNewPreviews((prev) => {
      const rest = prev.filter((_, i) => i !== index);
      // Đồng bộ lại input.files để FormData gửi đúng danh sách còn lại
      const dt = new DataTransfer();
      rest.forEach((p) => dt.items.add(p.file));
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      return rest;
    });
  }

  function toggleKeepImage(key: string) {
    setRemovedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

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
            Ảnh minh họa (0, 1 hoặc nhiều ảnh)
          </label>
          <input
            ref={fileInputRef}
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={onPickImages}
            className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent/20"
          />
        </div>
      </div>

      {/* Quản lý ảnh trực quan */}
      {(existingImages.length > 0 || newPreviews.length > 0) && (
        <div className="rounded-2xl border border-line bg-background/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Ảnh minh họa</p>
            <p className="text-xs text-foreground/45">
              {existingImages.length - removedKeys.length + newPreviews.length} ảnh sẽ lưu
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {existingImages.map((key) => {
              const removed = removedKeys.includes(key);
              return (
                <div key={key} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/media/${key}`}
                    alt="Ảnh hiện tại"
                    className={`aspect-square w-full rounded-xl border object-cover ${
                      removed ? "border-accent opacity-40" : "border-line"
                    }`}
                  />
                  <label
                    className={`absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded-lg px-1 py-1 text-[11px] font-semibold backdrop-blur ${
                      removed
                        ? "bg-accent text-white"
                        : "bg-black/50 text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!removed}
                      onChange={() => toggleKeepImage(key)}
                      className="accent-[var(--accent)]"
                    />
                    {removed ? "Sẽ xóa" : "Giữ"}
                  </label>
                  {removed && <input type="hidden" name="deleteImage" value={key} />}
                </div>
              );
            })}
            {newPreviews.map((p, i) => (
              <div key={p.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt="Ảnh mới"
                  className="aspect-square w-full rounded-xl border border-green-600/50 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow"
                  aria-label="Bỏ ảnh này"
                >
                  ✕
                </button>
                <span className="absolute bottom-1 left-1 rounded-lg bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Mới
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground/45">
            Ảnh mới sẽ được thêm vào, ảnh cũ bỏ tích “Giữ” sẽ bị xóa khi lưu.
          </p>
        </div>
      )}

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