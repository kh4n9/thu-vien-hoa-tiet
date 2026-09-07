"use client";

import { useEffect } from "react";
import { writeCartCookie } from "@/lib/cart-client";

/**
 * Xóa giỏ hàng sau khi thanh toán thành công (chạy 1 lần khi trang return mở).
 * Tránh việc khách thanh toán lại cùng một bộ sản phẩm đã mua.
 */
export function ClearCartOnSuccess() {
  useEffect(() => {
    writeCartCookie([]);
  }, []);
  return null;
}