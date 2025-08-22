import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma"; // if this alias fails, use: "../../../lib/prisma"

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();
    const rawRole = (body.role ?? "").toString().toUpperCase(); // "INSTRUCTOR" | "STUDENT"

    // minimal validation (keeping it simple)
    if (!email || !email.includes("@")) return bad("Valid email is required");
    if (password.length < 6) return bad("Password must be at least 6 characters");
    if (rawRole !== "INSTRUCTOR" && rawRole !== "STUDENT")
      return bad("Role must be INSTRUCTOR or STUDENT");

    // unique email
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return bad("Email already registered", 409);

    // hash & create
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: rawRole as "INSTRUCTOR" | "STUDENT" },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("register error:", err);
    return bad("Something went wrong", 500);
  }
}
