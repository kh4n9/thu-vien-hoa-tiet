"use client";

export function SortForm({
  categorySlug,
  q,
  sort,
}: {
  categorySlug: string;
  q: string;
  sort: string;
}) {
  return (
    <form method="get" className="flex items-center gap-2">
      {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
      {q && <input type="hidden" name="q" value={q} />}
      <label htmlFor="sort" className="text-sm text-foreground/60">
        Sắp xếp
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={sort}
        onChange={(e) => e.currentTarget.form?.submit()}
        className="h-10 rounded-full border border-line bg-surface px-3 text-sm outline-none focus:border-gold"
      >
        <option value="newest">Mới nhất</option>
        <option value="price-asc">Giá thấp → cao</option>
        <option value="price-desc">Giá cao → thấp</option>
      </select>
    </form>
  );
}
