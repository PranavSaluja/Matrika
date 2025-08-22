import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TableResult {
  name: string;
}

export async function GET() {
  const tables = await prisma.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
  );
  
  return NextResponse.json({
    ok: true,
    tables: (tables as TableResult[]).map(t => t.name),
  });
}