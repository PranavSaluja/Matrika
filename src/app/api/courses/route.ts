// src/app/api/courses/route.ts (updated GET method with proper types)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

interface LectureWithProgress {
  id: number;
  courseId: number;
  type: string;
  title: string;
  content: string | null;
  link: string | null;
  order: number;
  createdAt: Date;
  progress: {
    completed: boolean;
  }[];
}

interface CourseWithLectures {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  createdAt: Date;
  instructor: { id: number; email: string };
  _count: { lectures: number };
  lectures?: LectureWithProgress[];
}

interface CourseWithProgress {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  createdAt: Date;
  instructor: { id: number; email: string };
  _count: { lectures: number };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  lectures: undefined;
}

export async function GET() {
  try {
    const user = await getUser();
    
    const courses: CourseWithLectures[] = await prisma.course.findMany({
      include: {
        instructor: { select: { id: true, email: true } },
        _count: { select: { lectures: true } },
        ...(user?.role === "STUDENT" ? {
          lectures: {
            include: {
              progress: {
                where: { studentId: user.id },
                select: { completed: true }
              }
            }
          }
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    // For students, calculate progress
    if (user?.role === "STUDENT") {
      const coursesWithProgress: CourseWithProgress[] = courses.map((course: CourseWithLectures) => {
        const totalLectures = course._count.lectures;
        const completedLectures = course.lectures?.filter((lecture: LectureWithProgress) => 
          lecture.progress.length > 0 && lecture.progress[0].completed
        ).length || 0;

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          instructorId: course.instructorId,
          createdAt: course.createdAt,
          instructor: course.instructor,
          _count: course._count,
          progress: {
            completed: completedLectures,
            total: totalLectures,
            percentage: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0
          },
          lectures: undefined // Remove lectures from response to keep it clean
        };
      });

      return NextResponse.json(coursesWithProgress);
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

// Keep the existing POST method unchanged
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description }: { title: string; description: string } = await req.json().catch(() => ({}));

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        instructorId: user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        instructorId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error("POST /api/courses error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}