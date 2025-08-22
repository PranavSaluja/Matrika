// lib/jwt.ts
import * as jwt from "jsonwebtoken";

export type JWTPayload = {
  id: string;
  email: string;
  role: "INSTRUCTOR" | "STUDENT";
};

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "dev_secret_change_me";

export function signToken(
  payload: JWTPayload,
  options?: jwt.SignOptions
): string {
  // Default 7d expiry; allow override via options
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", ...options });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
