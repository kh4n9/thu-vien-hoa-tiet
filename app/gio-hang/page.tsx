import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCart } from "@/lib/cart";
import { formatVND } from "@/lib/utils";
import { CartControls } from "@/components/cart-controls";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cookieStore = await cookies();
  const session = await auth();
  const items = parseCart(cookieStore.get("cart")?.value);

  let products: ProductForCart[] = [];
  if (items.length > 0) {
    const ids = items.map((i) => i.id);
    products = await getProducts(ids);
  }

  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      return { ...product, qty: item.qty };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="mt-2 text-foreground/60">Hãy thêm một vài họa tiết yêu thích vào giỏ nhé.</p>
        <Link
          href="/bo-suu-tap"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Khám phá bộ sưu tập
        </Link>
      </div>
    );
  }

  const checkoutHref = session?.user ? "/thanh-toan" : "/dang-nhap?next=/thanh-toan";

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="font-display text-3xl font-medium tracking-tight">Giỏ hàng</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background">
                {line.imageKeys[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/media/${line.imageKeys[0]}`} alt={line.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-foreground/40">
                    {line.format}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/bo-suu-tap/${line.slug}`}
                  className="line-clamp-1 font-semibold hover:text-accent"
                >
                  {line.title}
                </Link>
                <p className="text-xs text-foreground/50">{line.format}</p>
                <p className="mt-1 font-bold">{formatVND(line.price)}</p>
              </div>
              <CartControls productId={line.id} />
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-20">
          <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-foreground/60">
              <span>Tạm tính</span>
              <span>{formatVND(total)}</span>
            </div>
            <div className="flex justify-between text-foreground/60">
              <span>Phí thanh toán</span>
              <span>Miễn phí</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
              <span>Tổng cộng</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>
          <Link
            href={checkoutHref}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Tiến hành thanh toán
          </Link>
          {!session?.user && (
            <p className="mt-2 text-center text-xs text-foreground/50">
              Bạn cần đăng nhập để thanh toán.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

async function getProducts(ids: string[]): Promise<ProductForCart[]> {
  return prisma.product
    .findMany({
      where: { id: { in: ids }, isActive: true },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        format: true,
        imageKeys: true,
      },
    })
    .catch(() => []);
}

type ProductForCart = {
  id: string;
  slug: string;
  title: string;
  price: number;
  format: string;
  imageKeys: string[];
};
