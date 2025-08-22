import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: user.id },
      include: {
        _count: {
          select: { lectures: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/instructor/courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}