// src/app/api/instructor/courses/[id]/lectures/[lectureId]/quiz/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

interface QuestionData {
  text: string;
  options: string[];
  correctIdx: number;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; lectureId: string }> } // FIX: Await params
) {
  try {
    const user = await getUser();
    const resolvedParams = await params; // FIX: Await params
    const courseId = parseInt(resolvedParams.id);
    const lectureId = parseInt(resolvedParams.lectureId);

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(courseId) || isNaN(lectureId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: user.id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 404 },
      );
    }

    const lecture = await prisma.lecture.findFirst({
      where: { id: lectureId, courseId: courseId, type: "QUIZ" },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!lecture) {
      return NextResponse.json(
        { error: "Quiz lecture not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("GET quiz error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; lectureId: string }> } // FIX: Await params
) {
  try {
    const user = await getUser();
    const resolvedParams = await params; // FIX: Await params
    const courseId = parseInt(resolvedParams.id);
    const lectureId = parseInt(resolvedParams.lectureId);

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(courseId) || isNaN(lectureId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const body = await req.json();
    const { questions }: { questions: QuestionData[] } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 },
      );
    }

    for (const q of questions) {
      if (
        !q.text ||
        !q.options ||
        !Array.isArray(q.options) ||
        q.options.length < 2
      ) {
        return NextResponse.json(
          { error: "Each question must have text and at least 2 options" },
          { status: 400 },
        );
      }
      if (
        typeof q.correctIdx !== "number" ||
        q.correctIdx < 0 ||
        q.correctIdx >= q.options.length
      ) {
        return NextResponse.json(
          { error: "Each question must have a valid correct answer index" },
          { status: 400 },
        );
      }
    }

    const lecture = await prisma.lecture.findFirst({
      where: {
        id: lectureId,
        courseId: courseId,
        type: "QUIZ",
        course: { instructorId: user.id },
      },
      include: { quiz: true },
    });

    if (!lecture || !lecture.quiz) {
      return NextResponse.json(
        { error: "Quiz not found or access denied" },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({
        where: { quizId: lecture.quiz!.id },
      });

      await tx.question.createMany({
        data: questions.map((q: QuestionData) => ({
          quizId: lecture.quiz!.id,
          text: q.text.trim(),
          options: q.options,
          correctIdx: q.correctIdx,
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST quiz error:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 },
    );
  }
}