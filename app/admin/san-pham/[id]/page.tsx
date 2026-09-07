import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Category, Product, toObjectId, type CategoryDoc } from "@/lib/models";
import { formatBytes, formatVND } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const productId = toObjectId(id);

  let product: {
    id: string;
    title: string;
    description: string;
    price: number;
    format: string;
    categoryId: string;
    specs: string;
    license: string;
    isActive: boolean;
    fileName: string;
    fileSize: number;
    slug: string;
    imageKeys: string[];
  } | null = null;
  let categories: { id: string; name: string }[] = [];

  try {
    await connectDb();
    const [doc, catDocs] = await Promise.all([
      productId
        ? Product.findById(productId)
            .select({
              title: 1,
              description: 1,
              price: 1,
              format: 1,
              category: 1,
              specs: 1,
              license: 1,
              isActive: 1,
              fileName: 1,
              fileSize: 1,
              slug: 1,
              imageKeys: 1,
            })
            .lean()
        : null,
      Category.find().sort({ order: 1 }).lean(),
    ]);
    if (doc) {
      product = {
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        price: doc.price,
        format: doc.format,
        categoryId: doc.category.toString(),
        specs: doc.specs ? JSON.stringify(doc.specs, null, 2) : "",
        license: doc.license ?? "",
        isActive: doc.isActive,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        slug: doc.slug,
        imageKeys: doc.imageKeys ?? [],
      };
    }
    categories = catDocs.map((c: CategoryDoc) => ({ id: c._id.toString(), name: c.name }));
  } catch {
    /* DB chưa kết nối */
  }

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
            specs: product.specs,
            license: product.license,
            isActive: product.isActive,
            images: product.imageKeys,
          }}
        />
      </div>
    </div>
  );
}