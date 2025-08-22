import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import  prisma  from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();

    if (!email || !email.includes("@")) return bad("Valid email is required");
    if (!password) return bad("Password is required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return bad("Invalid credentials", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return bad("Invalid credentials", 401);

    // issue JWT
    const token = signToken({ id: user.id, email: user.email, role: user.role as "INSTRUCTOR" | "STUDENT" });


    // create response + set HttpOnly cookie
    const res = NextResponse.json({ ok: true, id: user.id, role: user.role });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: true,      // stays true; fine for localhost
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (e) {
    console.error("login error:", e);
    return bad("Something went wrong", 500);
  }
}
