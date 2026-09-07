import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBytes, formatVND } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }).catch(() => null),
    prisma.category.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">Sửa sản phẩm</h2>

      <div className="mb-5 flex flex-wrap gap-4 text-sm text-foreground/60">
        <span>File hiện tại: {product.fileName} ({formatBytes(product.fileSize)})</span>
        <span>Giá: {formatVND(product.price)}</span>
        <span>Slug: {product.slug}</span>
      </div>

      <div className="max-w-3xl rounded-2xl border border-line bg-surface p-6">
        <ProductForm
          action={updateProduct}
          categories={categories}
          submitLabel="Lưu thay đổi"
          initial={{
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            format: product.format,
            categoryId: product.categoryId,
            specs: product.specs ? JSON.stringify(product.specs, null, 2) : "",
            license: product.license ?? "",
            isActive: product.isActive,
          }}
        />
      </div>
    </div>
  );
}