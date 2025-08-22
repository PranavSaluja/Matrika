import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma"; // Alias is working fine, removed old comment

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();
    const rawRole = (body.role ?? "").toString().toUpperCase(); // "INSTRUCTOR" | "STUDENT"

    // 1. Email validation
    if (!email || !email.includes("@")) {
      return bad("A valid email address is required.");
    }
    // Simple regex for basic email format, can be more robust
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return bad("Please enter a valid email address format.");
    }

    // 2. Password strength validation (improved from just length < 6)
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    
    if (password.length < 8) {
      return bad("Password must be at least 8 characters long.");
    }
    if (!passwordRegex.test(password)) {
      return bad("Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*()_+).");
    }

    // 3. Role validation
    if (rawRole !== "INSTRUCTOR" && rawRole !== "STUDENT") {
      return bad("Role must be either INSTRUCTOR or STUDENT.");
    }

    // 4. Unique email check
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return bad("This email address is already registered.", 409); // 409 Conflict status
    }

    // 5. Hash password & create user
    const passwordHash = await bcrypt.hash(password, 10); // Salt rounds: 10
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        role: rawRole as "INSTRUCTOR" | "STUDENT" 
      },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        createdAt: true 
      },
    });

    return NextResponse.json(user, { status: 201 }); // 201 Created status
  } catch (err) {
    console.error("register error:", err);
    return bad("An unexpected error occurred during registration.", 500); // More generic 500 error message
  }
}