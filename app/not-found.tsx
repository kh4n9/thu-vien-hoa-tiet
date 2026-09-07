import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-2 text-foreground/60">
        Trang bạn tìm không tồn tại hoặc đã bị gỡ.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
