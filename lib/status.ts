// Nhãn + màu badge cho trạng thái đơn hàng (dùng chung các trang admin).
export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_CLS: Record<string, string> = {
  PENDING: "bg-gold/15 text-gold",
  PAID: "bg-green-600/10 text-green-600 dark:text-green-400",
  FAILED: "bg-accent/10 text-accent",
  CANCELLED: "bg-line text-foreground/50",
};

export function statusBadge(status: string) {
  return {
    text: ORDER_STATUS_LABEL[status] ?? status,
    cls: ORDER_STATUS_CLS[status] ?? "bg-line text-foreground/50",
  };
}

/** Chuyển Date -> chuỗi hiển thị theo múi giờ Việt Nam. */
export function fmtDateTime(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function fmtDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}