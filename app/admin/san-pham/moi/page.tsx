import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">Thêm sản phẩm mới</h2>
      <div className="max-w-3xl rounded-2xl border border-line bg-surface p-6">
        <ProductForm action={createProduct} categories={categories} submitLabel="Tạo sản phẩm" />
      </div>
    </div>
  );
}