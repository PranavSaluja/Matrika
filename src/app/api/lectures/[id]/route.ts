import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const lectureId = parseInt(params.id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(lectureId)) {
      return NextResponse.json({ error: "Invalid lecture ID" }, { status: 400 });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        course: {
          select: { id: true, title: true, instructorId: true }
        },
        quiz: user.role === "STUDENT" ? {
          select: {
            id: true,
            passPct: true,
            questions: {
              select: {
                id: true,
                text: true,
                options: true
                // Don't include correctIdx for students
              }
            }
          }
        } : {
          include: { questions: true } // Include everything for instructors
        },
        progress: user.role === "STUDENT" ? {
          where: { studentId: user.id },
          select: { completed: true, score: true }
        } : false
      }
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    // For students, check if they can access this lecture (sequential access)
    if (user.role === "STUDENT") {
      const previousLectures = await prisma.lecture.findMany({
        where: {
          courseId: lecture.course.id,
          order: { lt: lecture.order }
        },
        include: {
          progress: {
            where: { studentId: user.id },
            select: { completed: true }
          }
        }
      });

      // Check if all previous lectures are completed
      const allPreviousCompleted = previousLectures.every((prevLecture: {
        progress: { completed: boolean }[]
      }) => 
        prevLecture.progress.length > 0 && prevLecture.progress[0].completed
      );

      if (!allPreviousCompleted && lecture.order > 1) {
        return NextResponse.json({ error: "Complete previous lectures first" }, { status: 403 });
      }
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("GET /api/lectures/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch lecture" }, { status: 500 });
  }
}