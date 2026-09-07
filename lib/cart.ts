export type CartItem = { id: string; qty: number };

/**
 * Đọc giỏ hàng từ cookie. Sản phẩm là file số — mỗi loại luôn được tính 1 bản:
 * - qty bị khóa về 1 (cookie cũ có qty > 1 sẽ không bị tính tiền gấp bội)
 * - loại bỏ trùng lặp id (cookie cũ thêm nhiều lần sẽ không bị đếm 2 lần)
 */
export function parseCart(value?: string): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
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

export function cartTotalItems(items: CartItem[]): number {
  return items.length;
}