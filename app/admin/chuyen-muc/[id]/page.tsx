import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Category, toObjectId } from "@/lib/models";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditCategoryPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const categoryId = toObjectId(id);

  let initial: { id: string; name: string; slug: string; description: string; order: number } | null = null;
  try {
    await connectDb();
    const doc = categoryId
      ? await Category.findById(categoryId)
          .select({ name: 1, slug: 1, description: 1, order: 1 })
          .lean()
      : null;
    if (doc) {
      const d = doc as unknown as { _id: { toString(): string }; name: string; slug: string; description: string | null; order: number };
      initial = {
        id: d._id.toString(),
        name: d.name,
        slug: d.slug,
        description: d.description ?? "",
        order: d.order,
      };
    }
  } catch {
    /* DB chưa kết nối */
  }

  if (!initial) notFound();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold tracking-tight">Sửa chuyên mục</h2>
      <CategoryForm
        action={updateCategory}
        initial={initial}
        submitLabel="Lưu thay đổi"
        cancelHref="/admin/chuyen-muc"
      />
    </div>
  );
}