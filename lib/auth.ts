import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User, type UserDoc } from "@/lib/models";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Bật Google khi đã có clientId/secret trong .env (tránh lỗi khi chưa cấu hình).
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

/** Tìm user theo email (lowercase) trong Mongo. */
async function findUserByEmail(email: string) {
  await connectDb();
  return (await User.findOne({ email: email.toLowerCase() }).lean()) as unknown as UserDoc | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/dang-nhap" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    // OAuth: tạo/cập nhật user trong Mongo theo email trước khi tạo phiên.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        await connectDb();
        const existing = await User.findOne({ email: user.email.toLowerCase() });
        if (!existing) {
          await User.create({
            email: user.email.toLowerCase(),
            name: user.name ?? null,
            image: user.image ?? null,
            passwordHash: "", // OAuth — không đăng nhập bằng mật khẩu
            role: "CUSTOMER",
          });
        } else {
          const $set: Record<string, unknown> = {};
          if (user.name && existing.name !== user.name) $set.name = user.name;
          if (user.image && existing.image !== user.image) $set.image = user.image;
          if (Object.keys($set).length > 0) await User.updateOne({ _id: existing._id }, { $set });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // Khi đăng nhập (user có dữ liệu), đồng bộ id/role/image từ Mongo — dùng chung cho cả
      // credentials và OAuth (id của Google không phải id trong DB của mình).
      if (user && user.email) {
        const dbUser = await findUserByEmail(user.email);
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.picture = dbUser.image ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = (token.picture as string | undefined) ?? null;
      }
      return session;
    },
  },
});

export { googleConfigured };