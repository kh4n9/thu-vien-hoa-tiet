"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { putObject, deleteObject } from "@/lib/r2";
import { slugify } from "@/lib/utils";

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
  while (await prisma.product.findUnique({ where: { slug } })) {
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

  await prisma.product.create({
    data: {
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
      specs: parseSpecs(parsed.data.specs),
      license: parsed.data.license,
      isActive: parsed.data.isActive,
      categoryId: parsed.data.categoryId,
    },
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
  const existing = await prisma.product.findUnique({ where: { id } });
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

  await prisma.product.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      format: parsed.data.format,
      fileKey,
      fileName,
      fileSize,
      fileExt,
      imageKeys,
      specs: parseSpecs(parsed.data.specs),
      license: parsed.data.license,
      isActive: parsed.data.isActive,
      categoryId: parsed.data.categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  revalidatePath(`/bo-suu-tap/${existing.slug}`);

  return { error: undefined };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) redirect("/admin/san-pham");

  try {
    // Sản phẩm chưa từng được đặt hàng → xóa hẳn (cả file trên R2).
    await prisma.product.delete({ where: { id } });

    await deleteObject(product.fileKey).catch(() => null);
    for (const key of product.imageKeys) {
      await deleteObject(key).catch(() => null);
    }
  } catch {
    // Sản phẩm đã nằm trong đơn hàng (FK ràng buộc OrderItem) → không xóa,
    // chỉ ẩn khỏi gian hàng để không phá lịch sử đơn.
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  revalidatePath("/");
  revalidatePath("/bo-suu-tap");
  redirect("/admin/san-pham");
}