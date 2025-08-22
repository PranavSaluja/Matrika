import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "token",
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0, // expire now
  });
  return res;
}
