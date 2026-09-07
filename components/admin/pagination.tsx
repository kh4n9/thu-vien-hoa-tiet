import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const btn = (disabled: boolean) =>
    cn(
      "rounded-lg border border-line px-3 py-1.5 text-sm transition-colors",
      disabled ? "pointer-events-none opacity-40" : "hover:border-accent hover:text-accent",
    );

  return (
    <div className="flex items-center justify-center gap-1.5 pt-5">
      <Link href={makeHref(page - 1)} aria-disabled={page <= 1} className={btn(page <= 1)}>
        ‹
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm transition-colors",
            p === page
              ? "border-accent bg-accent font-semibold text-white"
              : "border-line hover:border-accent hover:text-accent",
          )}
        >
          {p}
        </Link>
      ))}
      <Link href={makeHref(page + 1)} aria-disabled={page >= totalPages} className={btn(page >= totalPages)}>
        ›
      </Link>
    </div>
  );
}