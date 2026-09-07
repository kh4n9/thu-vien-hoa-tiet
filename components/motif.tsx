import { cn } from "@/lib/utils";

/**
 * Hoa văn vàng lá — chữ ký thị giác của Thư viện Họa Tiết.
 * Một biểu tượng họa tiết Đông Á (lục giác/lotus) dùng làm logo & đường phân cách.
 */
export function Motif({
  className,
  strokeWidth = 1.4,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("text-gold", className)}
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
        <path d="M24 4 L42 24 L24 44 L6 24 Z" />
        <path d="M24 12 L36 24 L24 36 L12 24 Z" />
        <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
        <path d="M24 4 V44 M6 24 H42" opacity="0.35" />
      </g>
    </svg>
  );
}

/** Đường phân cách có hoa văn ở giữa. */
export function MotifDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <Motif className="h-5 w-5 opacity-80" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
