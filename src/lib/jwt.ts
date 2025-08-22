import * as jwt from "jsonwebtoken"; // <-- key change

const SECRET: jwt.Secret = process.env.JWT_SECRET as jwt.Secret;
if (!SECRET) {
  throw new Error("JWT_SECRET missing. Add it to your .env");
}

export type JWTPayload = { id: number; role: "INSTRUCTOR" | "STUDENT" };

/** 7 days in seconds */
const WEEK = 60 * 60 * 24 * 7;

export function signJwt(payload: JWTPayload, expiresInSec: number = WEEK) {
  return jwt.sign(payload, SECRET, { expiresIn: expiresInSec });
}

export function verifyJwt(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
