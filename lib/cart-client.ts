import type { CartItem } from "@/lib/cart";

const CART_COOKIE = "cart";

export function readCartCookie(): CartItem[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CART_COOKIE}=`));
  if (!match) return [];
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(match.split("=")[1]));
    if (Array.isArray(parsed)) {
      // File số: mỗi sản phẩm luôn 1 bản, loại bỏ trùng lặp từ cookie cũ.
      const seen = new Set<string>();
      const items: CartItem[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item.id === "string" &&
          typeof item.qty === "number" &&
          !seen.has(item.id)
        ) {
          seen.add(item.id);
          items.push({ id: item.id, qty: 1 });
        }
      }
      return items;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function writeCartCookie(items: CartItem[]) {
  document.cookie = `${CART_COOKIE}=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=604800; samesite=lax`;
}