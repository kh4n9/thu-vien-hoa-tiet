import { connectDb } from "@/lib/db";
import { Category } from "@/lib/models";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories: { id: string; name: string }[] = [];
  try {
    await connectDb();
    const docs = await Category.find().sort({ order: 1 }).lean();
    categories = docs.map((c) => ({ id: c._id.toString(), name: c.name }));
  } catch {
    /* DB chưa kết nối */
  }

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold">Thêm sản phẩm mới</h2>
      <div className="max-w-3xl rounded-2xl border border-line bg-surface p-6">
        <ProductForm action={createProduct} categories={categories} submitLabel="Tạo sản phẩm" />
      </div>
    </div>
  );
}