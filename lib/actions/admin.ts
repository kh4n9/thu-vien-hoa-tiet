"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { putObject, deleteObject } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { Product, Order, Category, toObjectId } from "@/lib/models";

export type ProductFormState = { error?: string };

const productSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200),
  description: z.string().trim().min(10, "Mô tả tối thiểu 10 ký tự"),
  price: z.coerce.number().int().positive("Giá phải là số dương"),
  categoryId: z.string().min(1, "Chọn chuyên mục"),
  format: z.string().trim().min(1, "Nhập định dạng file").max(20),
  specs: z.string().optional(),
  license: z.string().optional(),
  isActive: z.boolean().default(true),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dang-nhap");
  return session.user;
}

function toProductImageKeys(images: File[], prefix: string): string[] {
  return images.map((img) => `${prefix}/${img.name}`);
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await Product.exists({ slug })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function parseSpecs(raw: string | undefined): Record<string, string> | undefined {
  if (!raw || !raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, String(v)]),
      );
    }
  } catch {
    /* bỏ qua nếu không phải JSON hợp lệ */
  }
  return undefined;
}

export async function createProduct(_prev: ProductFormState, formData: FormData) {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    format: formData.get("format"),
    specs: formData.get("specs") || undefined,
    license: formData.get("license") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Vui lòng chọn file bản vẽ để tải lên." };
  }

  const images = (formData.getAll("images") as File[]).filter(
    (f) => f instanceof File && f.size > 0,
  );

  const slug = await ensureUniqueSlug(slugify(parsed.data.title));
  const prefix = `products/${slug}-${Date.now()}`;

  const fileKey = `${prefix}/${file.name}`;
  await putObject(fileKey, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream");

  const imageKeys = toProductImageKeys(images, prefix);
  for (let i = 0; i < images.length; i++) {
    await putObject(
      imageKeys[i],
      Buffer.from(await images[i].arrayBuffer()),
      images[i].type || "image/jpeg",
    );
  }

  await connectDb();
  await Product.create({
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price,
    format: parsed.data.format,
    fileKey,
    fileName: file.name,
    fileSize: file.size,
    fileExt: file.name.split(".").pop()?.toUpperCase() ?? parsed.data.format,
    imageKeys,
    specs: parseSpecs(parsed.data.specs) ?? null,
    license: parsed.data.license ?? null,
    isActive: parsed.data.isActive,
    category: parsed.data.categoryId,
  });

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  redirect("/admin/san-pham");
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const productId = toObjectId(id);
  await connectDb();
  const existing = await Product.findById(productId);
  if (!existing) return { error: "Sản phẩm không tồn tại." };

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    format: formData.get("format"),
    specs: formData.get("specs") || undefined,
    license: formData.get("license") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  let fileKey = existing.fileKey;
  let fileName = existing.fileName;
  let fileSize = existing.fileSize;
  let fileExt = existing.fileExt;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    fileKey = `${existing.slug}-${Date.now()}/${file.name}`;
    await putObject(fileKey, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream");
    fileName = file.name;
    fileSize = file.size;
    fileExt = file.name.split(".").pop()?.toUpperCase() ?? parsed.data.format;
    await deleteObject(existing.fileKey).catch(() => null);
  }

  let imageKeys = existing.imageKeys;
  const images = (formData.getAll("images") as File[]).filter(
    (f) => f instanceof File && f.size > 0,
  );
  if (images.length > 0) {
    const prefix = `products/${existing.slug}-${Date.now()}`;
    const newKeys = toProductImageKeys(images, prefix);
    for (let i = 0; i < images.length; i++) {
      await putObject(
        newKeys[i],
        Buffer.from(await images[i].arrayBuffer()),
        images[i].type || "image/jpeg",
      );
    }
    // Xóa ảnh cũ
    for (const key of existing.imageKeys) {
      await deleteObject(key).catch(() => null);
    }
    imageKeys = newKeys;
  }

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        format: parsed.data.format,
        fileKey,
        fileName,
        fileSize,
        fileExt,
        imageKeys,
        specs: parseSpecs(parsed.data.specs) ?? null,
        license: parsed.data.license ?? null,
        isActive: parsed.data.isActive,
        category: parsed.data.categoryId,
      },
    },
  );

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  revalidatePath(`/bo-suu-tap/${existing.slug}`);

  return { error: undefined };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const productId = toObjectId(id);
  await connectDb();
  if (!productId) redirect("/admin/san-pham");

  const product = await Product.findById(productId);
  if (!product) redirect("/admin/san-pham");

  // Sản phẩm đã nằm trong đơn hàng → không xóa (giữ lịch sử đơn), chỉ ẩn.
  const used = await Order.exists({ "items.product": productId });
  if (used) {
    await Product.updateOne({ _id: productId }, { $set: { isActive: false } });
  } else {
    await Product.deleteOne({ _id: productId });
    await deleteObject(product.fileKey).catch(() => null);
    for (const key of product.imageKeys) {
      await deleteObject(key).catch(() => null);
    }
  }

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  redirect("/admin/san-pham");
}

// ===== Đơn hàng: đổi trạng thái =====
const ORDER_STATUS_VALUES = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"] as const;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED", "FAILED"],
  PAID: ["REFUNDED"],
};

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUS_VALUES.includes(status as (typeof ORDER_STATUS_VALUES)[number])) return;

  const oid = toObjectId(id);
  if (!oid) return;

  await connectDb();
  const order = await Order.findById(oid).select({ status: 1 }).lean();
  if (!order) return;

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) return;

  const $set: Record<string, unknown> = { status };
  if (status === "PAID") $set.paidAt = new Date();
  if (status === "PENDING") $set.paidAt = null;
  await Order.updateOne({ _id: oid }, { $set });

  revalidatePath("/admin");
  revalidatePath("/admin/don-hang");
  revalidatePath(`/admin/don-hang/${id}`);
}

// ===== Sản phẩm: bật/tắt hiển thị nhanh =====
export async function toggleProductActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const productId = toObjectId(id);
  if (!productId) return;

  await connectDb();
  const product = await Product.findById(productId).select({ isActive: 1 }).lean();
  if (!product) return;
  await Product.updateOne({ _id: productId }, { $set: { isActive: !product.isActive } });

  revalidatePath("/admin");
  revalidatePath("/admin/san-pham");
  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
}

// ===== Chuyên mục =====
export type CategoryFormState = { error?: string };

const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên chuyên mục tối thiểu 2 ký tự").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Slug tối thiểu 2 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự").optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await connectDb();
  const dup = await Category.exists({ slug: parsed.data.slug });
  if (dup) return { error: "Slug đã tồn tại — hãy chọn slug khác." };

  await Category.create({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    order: parsed.data.order,
  });

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  redirect("/admin/chuyen-muc");
}

export async function updateCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const categoryId = toObjectId(id);

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  if (!categoryId) return { error: "Chuyên mục không tồn tại." };

  await connectDb();
  const existing = await Category.findById(categoryId);
  if (!existing) return { error: "Chuyên mục không tồn tại." };

  const dup = await Category.exists({ slug: parsed.data.slug, _id: { $ne: categoryId } });
  if (dup) return { error: "Slug đã tồn tại — hãy chọn slug khác." };

  await Category.updateOne(
    { _id: categoryId },
    {
      $set: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        order: parsed.data.order,
      },
    },
  );

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  revalidatePath("/admin/chuyen-muc");
  redirect("/admin/chuyen-muc");
}

export async function deleteCategory(formData: FormData): Promise<CategoryFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const categoryId = toObjectId(id);
  if (!categoryId) return { error: "Chuyên mục không tồn tại." };

  await connectDb();
  const category = await Category.findById(categoryId);
  if (!category) return { error: "Chuyên mục không tồn tại." };

  const used = await Product.exists({ category: categoryId });
  if (used) {
    return { error: `Chuyên mục "${category.name}" còn sản phẩm — không thể xóa.` };
  }

  await Category.deleteOne({ _id: categoryId });

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  revalidatePath("/admin/chuyen-muc");
  redirect("/admin/chuyen-muc");
}