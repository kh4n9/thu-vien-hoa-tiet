// Hình dạng sản phẩm dùng cho ProductCard (trang chủ, bộ sưu tập).
export type ProductForCard = {
  slug: string;
  title: string;
  price: number;
  format: string;
  fileSize: number;
  imageKeys: string[];
  category: { name: string; slug: string };
};

/** Chuyển document Product (lean + populate category) sang dạng card. */
export function toCardProduct(p: {
  slug: string;
  title: string;
  price: number;
  format: string;
  fileSize: number;
  imageKeys: string[];
  category: unknown;
}): ProductForCard {
  const cat = p.category as { name?: string; slug?: string } | null;
  return {
    slug: p.slug,
    title: p.title,
    price: p.price,
    format: p.format,
    fileSize: p.fileSize,
    imageKeys: p.imageKeys ?? [],
    category: { name: cat?.name ?? "Khác", slug: cat?.slug ?? "" },
  };
}