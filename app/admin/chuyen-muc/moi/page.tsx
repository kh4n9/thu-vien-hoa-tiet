import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/lib/actions/admin";

export default function NewCategoryPage() {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold tracking-tight">Thêm chuyên mục</h2>
      <CategoryForm action={createCategory} submitLabel="Tạo chuyên mục" cancelHref="/admin/chuyen-muc" />
    </div>
  );
}