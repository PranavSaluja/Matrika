import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const courseId = parseInt(params.id);

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: user.id }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const { type, title, content } = body;

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
    }

    if (type !== "READING" && type !== "QUIZ") {
      return NextResponse.json({ error: "Type must be READING or QUIZ" }, { status: 400 });
    }

    // Get next order number
    const lastLecture = await prisma.lecture.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });

    const nextOrder = (lastLecture?.order || 0) + 1;

    // Create lecture
    const lecture = await prisma.lecture.create({
      data: {
        courseId,
        type,
        title: title.trim(),
        content: content?.trim() || null,
        order: nextOrder
      }
    });

    // If it's a quiz, create the quiz record
    if (type === "QUIZ") {
      await prisma.quiz.create({
        data: {
          lectureId: lecture.id,
          passPct: 70 // default passing percentage
        }
      });
    }

    return NextResponse.json(lecture, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/[id]/lectures error:", error);
    return NextResponse.json({ error: "Failed to create lecture" }, { status: 500 });
  }
}