import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, email: true } },
        lectures: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            progress: user ? {
              where: { studentId: user.id },
              select: { completed: true, score: true }
            } : false
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}