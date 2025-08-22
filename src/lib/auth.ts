import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export type AuthUser = {
  id: number;
  email: string;
  role: "INSTRUCTOR" | "STUDENT";
};

export async function getUser(): Promise<AuthUser | null> {
  // Handle both sync and async return types of cookies()
  const cookieStore: Awaited<ReturnType<typeof cookies>> = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    return verifyToken(token) as AuthUser;
  } catch {
    return null;
  }
}
