"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Tổng quan", icon: "grid" },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: "receipt" },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: "box" },
  { href: "/admin/chuyen-muc", label: "Chuyên mục", icon: "folder" },
  { href: "/admin/khach-hang", label: "Khách hàng", icon: "users" },
  { href: "/admin/tai-file", label: "Tải file", icon: "download" },
] as const;

function Icon({ name }: { name: (typeof ADMIN_NAV)[number]["icon"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3Z" />
          <path d="M9 8h6M9 12h6" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
          <path d="M3 7.5 12 12l9-4.5M12 12v9" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5" />
          <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9M17.5 15.2c1.7.6 2.8 2.2 3 4.8" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v10M7.5 10.5 12 15l4.5-4.5" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
  }
}

function itemClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-accent text-white shadow-sm shadow-accent/30"
      : "text-foreground/70 hover:bg-line/50 hover:text-foreground",
  );
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {ADMIN_NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          onClick={onNavigate}
          className={cn(itemClass(isActive(n.href)), "whitespace-nowrap")}
        >
          <Icon name={n.icon} />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}