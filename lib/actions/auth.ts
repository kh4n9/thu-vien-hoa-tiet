"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { signOut } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên").max(100),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export type RegisterState = { error?: string };

export async function register(_prev: RegisterState, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const email = parsed.data.email.toLowerCase();
  await connectDb();

  const existing = await User.exists({ email });
  if (existing) {
    return { error: "Email này đã được đăng ký." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await User.create({
    email,
    name: parsed.data.name,
    passwordHash,
    role: "CUSTOMER",
  });

  redirect("/dang-nhap?registered=1");
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}