import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDb } from "@/lib/db";
import { Product, type ProductDoc } from "@/lib/models";
import { formatVND, formatBytes } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart";
import { BuyNowButton } from "@/components/buy-now-button";
import { MotifPlaceholder } from "@/components/product-card";

export const dynamic = "force-dynamic";

type Params = { slug: string };

type ProductDetail = Omit<ProductDoc, "category" | "specs"> & {
  category: { name: string; slug: string };
  specs: Record<string, unknown> | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  let title: string | undefined;
  let description: string | undefined;
  try {
    await connectDb();
    const product = await Product.findOne({ slug })
      .select({ title: 1, description: 1 })
      .lean();
    title = product?.title;
    description = product?.description;
  } catch {
    /* DB chưa kết nối */
  }
  return {
    title: title ?? "Sản phẩm",
    description,
  };
}

export default async function ProductDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let product: ProductDetail | null = null;
  try {
    await connectDb();
    const doc = await Product.findOne({ slug }).populate("category", "name slug").lean();
    if (doc) {
      const cat = doc.category as unknown as { name: string; slug: string };
      product = {
        ...doc,
        category: cat,
        specs: (doc.specs as Record<string, unknown> | null) ?? null,
      };
    }
  } catch {
    product = null;
  }

  if (!product) notFound();

  const specs: Record<string, string> | null =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? Object.fromEntries(
          Object.entries(product.specs).map(([k, v]) => [k, String(v)]),
        )
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <nav className="mb-6 text-sm text-foreground/50">
        <Link href="/bo-suu-tap" className="hover:text-accent">
          Bộ sưu tập
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/bo-suu-tap?category=${product.category.slug}`} className="hover:text-accent">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground/70">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {product.imageKeys.length > 0 ? (
            <div className="grid gap-2">
              {product.imageKeys.map((key) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={key} src={`/media/${key}`} alt={product.title} className="w-full object-cover" />
              ))}
            </div>
          ) : (
            <div className="aspect-square">
              <MotifPlaceholder label={product.category.name} />
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {product.category.name}
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              {product.title}
            </h1>
          </div>

          <p className="text-3xl font-extrabold text-accent">{formatVND(product.price)}</p>

          <p className="leading-relaxed text-foreground/70">{product.description}</p>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-line bg-surface px-3 py-1 font-medium">
              Định dạng: {product.format}
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1 font-medium">
              Dung lượng: {formatBytes(product.fileSize)}
            </span>
          </div>

          {specs && (
            <div className="overflow-hidden rounded-xl border border-line">
              {Object.entries(specs).map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex justify-between gap-4 px-4 py-2.5 text-sm ${
                    i % 2 ? "bg-background/50" : ""
                  }`}
                >
                  <span className="text-foreground/60">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface p-4 text-sm text-foreground/70">
            <span className="font-semibold text-foreground">Lưu ý:</span> Bạn sẽ tải file ngay
            trong mục <span className="font-semibold">Thư viện</span> sau khi thanh toán thành
            công. Ảnh hiển thị chỉ để xem trước, file gốc có chất lượng đầy đủ.
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <BuyNowButton productId={product._id.toString()} next={`/bo-suu-tap/${product.slug}`} />
              <AddToCart
                productId={product._id.toString()}
                className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-surface px-6 text-base font-semibold text-foreground/80 transition-colors hover:bg-line/40"
              />
            </div>
            <Link
              href="/gio-hang"
              className="inline-flex h-12 items-center justify-center rounded-full border border-dashed border-line px-6 text-sm font-medium text-foreground/60 transition-colors hover:text-accent"
            >
              Xem giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}