import type { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import { Product } from "@/lib/models";

const base = process.env.AUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/bo-suu-tap",
    "/huong-dan",
    "/faq",
    "/giay-phep",
    "/lien-he",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectDb();
    const products = await Product.find({ isActive: true })
      .select({ slug: 1, updatedAt: 1 })
      .lean();
    productRoutes = products.map((p) => ({
      url: `${base}/bo-suu-tap/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    /* DB chưa kết nối */
  }

  return [...staticRoutes, ...productRoutes];
}