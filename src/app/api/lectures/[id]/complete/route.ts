// src/app/api/lectures/[id]/complete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

interface LectureWithProgress {
  id: number;
  courseId: number;
  type: string;
  progress: {
    completed: boolean;
  }[];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // FIX: Await params
) {
  try {
    const user = await getUser();
    const resolvedParams = await params; // FIX: Await params
    const lectureId = parseInt(resolvedParams.id); // FIX: Await params

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(lectureId)) {
      return NextResponse.json(
        { error: "Invalid lecture ID" },
        { status: 400 },
      );
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: { course: true },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    if (lecture.type !== "READING") {
      return NextResponse.json(
        { error: "Only reading lectures can be marked complete this way" },
        { status: 400 },
      );
    }

    const previousLectures: LectureWithProgress[] =
      await prisma.lecture.findMany({
        where: {
          courseId: lecture.courseId,
          order: { lt: lecture.order },
        },
        include: {
          progress: {
            where: { studentId: user.id },
            select: { completed: true },
          },
        },
      });

    const allPreviousCompleted = previousLectures.every(
      (prevLecture: LectureWithProgress) =>
        prevLecture.progress.length > 0 && prevLecture.progress[0].completed,
    );

    if (!allPreviousCompleted && lecture.order > 1) {
      return NextResponse.json(
        { error: "Complete previous lectures first" },
        { status: 403 },
      );
    }

    const progress = await prisma.progress.upsert({
      where: {
        studentId_lectureId: {
          studentId: user.id,
          lectureId: lectureId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        studentId: user.id,
        lectureId: lectureId,
        completed: true,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("POST /api/lectures/[id]/complete error:", error);
    return NextResponse.json(
      { error: "Failed to mark lecture complete" },
      { status: 500 },
    );
  }
}