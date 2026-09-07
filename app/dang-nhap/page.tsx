import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Đăng nhập" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const registered = sp.registered === "1";

  return (
    <>
      {registered && (
        <div className="mx-auto w-full max-w-md px-4 pt-10">
          <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
            Đăng ký thành công. Mời bạn đăng nhập để tiếp tục.
          </p>
        </div>
      )}
      <LoginForm />
    </>
  );
}