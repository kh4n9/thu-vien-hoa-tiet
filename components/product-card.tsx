import Link from "next/link";
import { formatVND, formatBytes, cn } from "@/lib/utils";

type ProductForCard = {
  slug: string;
  title: string;
  price: number;
  format: string;
  fileSize: number;
  imageKeys: string[];
  category: { name: string; slug: string };
};

export function ProductCard({ product }: { product: ProductForCard }) {
  const image = product.imageKeys[0];

  return (
    <Link
      href={`/bo-suu-tap/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.4)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${image}`}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <MotifPlaceholder label={product.category.name} />
        )}
        <span className="absolute left-2.5 top-2.5 rounded-sm border border-ivory/30 bg-lacquer/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ivory backdrop-blur">
          {product.format}
        </span>
        <CornerFrame />
      </div>

      <div className="flex flex-1 flex-col space-y-1.5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
          {product.category.name}
        </p>
        <h3 className="line-clamp-1 font-display text-[15px] font-medium leading-snug text-foreground">
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-sm font-bold tracking-tight text-accent">
            {formatVND(product.price)}
          </span>
          <span className="text-[10px] text-foreground/45">{formatBytes(product.fileSize)}</span>
        </div>
      </div>
    </Link>
  );
}

function CornerFrame() {
  const c = "absolute h-3.5 w-3.5 border-gold/70";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className={`${c} left-2 top-2 border-l border-t`} />
      <span className={`${c} right-2 top-2 border-r border-t`} />
      <span className={`${c} bottom-2 left-2 border-b border-l`} />
      <span className={`${c} bottom-2 right-2 border-b border-r`} />
    </div>
  );
}

export function MotifPlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn("relative flex h-full w-full items-center justify-center bg-surface-2", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23b98a33' stroke-opacity='0.28' stroke-width='1'%3E%3Cpath d='M28 8 L46 28 L28 48 L10 28 Z'/%3E%3Cpath d='M28 20 L36 28 L28 36 L20 28 Z'/%3E%3C/g%3E%3C/svg%3E\")",
        backgroundSize: "56px 56px",
      }}
    >
      {label && (
        <span className="border border-gold/40 bg-surface/80 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
