import type { Metadata } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Thư viện Họa Tiết — Bản vẽ kỹ thuật họa tiết cổ truyền",
    template: "%s | Thư viện Họa Tiết",
  },
  description:
    "Kho bản vẽ kỹ thuật họa tiết cổ truyền Á Đông dành cho CNC, khắc gỗ, laser và thêu mỹ nghệ. Tải file sau khi thanh toán.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${beVietnam.variable} ${newsreader.variable} flex min-h-full flex-col antialiased`}
      >
        <ThemeProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
