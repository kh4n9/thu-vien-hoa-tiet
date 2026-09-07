import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { SortForm } from "@/components/sort-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bộ sưu tập họa tiết" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Browse({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const categorySlug = typeof sp.category === "string" ? sp.category : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";

  let categories: { name: string; slug: string }[] = [];
  let products: Awaited<ReturnType<typeof getProducts>> = [];

  try {
    categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
    products = await getProducts({ categorySlug, q, sort });
  } catch {
    // DB chưa kết nối
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Thư viện họa tiết</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">
          Bộ sưu tập họa tiết
        </h1>
        <p className="mt-2 text-foreground/60">
          Lọc theo chuyên mục hoặc tìm kiếm theo tên họa tiết.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/bo-suu-tap"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !categorySlug
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface hover:border-accent hover:text-accent"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={{ pathname: "/bo-suu-tap", query: { ...(q ? { q } : {}), category: c.slug, sort } }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                categorySlug === c.slug
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface hover:border-accent hover:text-accent"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form method="get" className="flex flex-1 gap-2">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm họa tiết (VD: hoa sen, trống đồng…)"
              className="h-10 flex-1 rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Tìm
            </button>
          </form>

          <SortForm categorySlug={categorySlug} q={q} sort={sort} />
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold">Không tìm thấy họa tiết phù hợp</p>
          <p className="mt-1 text-foreground/50">Thử từ khóa khác hoặc xóa bộ lọc.</p>
        </div>
      )}
    </div>
  );
}

async function getProducts({
  categorySlug,
  q,
  sort,
}: {
  categorySlug: string;
  q: string;
  sort: string;
}) {
  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      format: true,
      fileSize: true,
      imageKeys: true,
      category: { select: { name: true, slug: true } },
    },
  });
}
