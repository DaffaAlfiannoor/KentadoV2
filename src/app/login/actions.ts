"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { admins } from "@/db/schema";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import { createSessionToken } from "@/lib/jwt";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const adminRows = await db.select().from(admins);
  const admin = adminRows.find((a) => a.username === username);

  if (!admin) {
    return { error: "Kredensial tidak valid." };
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    return { error: "Kredensial tidak valid." };
  }

  const token = await createSessionToken({
    sub: String(admin.id),
    username: admin.username,
  });
  await setSessionCookie(token);
  revalidatePath("/", "layout");
  redirect("/app/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}
