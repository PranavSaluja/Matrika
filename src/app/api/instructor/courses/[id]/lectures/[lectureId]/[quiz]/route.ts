// src/app/api/instructor/courses/[id]/lectures/[lectureId]/quiz/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

interface QuestionData {
  text: string;
  options: string[];
  correctIdx: number;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string; lectureId: string } }
) {
  try {
    const user = await getUser();
    const courseId = Number(params.id);
    const lectureId = Number(params.lectureId);

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Number.isFinite(courseId) || !Number.isFinite(lectureId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: user.id }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
    }

    const lecture = await prisma.lecture.findFirst({
      where: { id: lectureId, courseId: courseId, type: "QUIZ" },
      include: {
        quiz: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!lecture) {
      return NextResponse.json({ error: "Quiz lecture not found" }, { status: 404 });
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("GET quiz error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; lectureId: string } }
) {
  try {
    const user = await getUser();
    const courseId = Number(params.id);
    const lectureId = Number(params.lectureId);

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Number.isFinite(courseId) || !Number.isFinite(lectureId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const body = await req.json();
    const { questions }: { questions: QuestionData[] } = body ?? {};

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "At least one question is required" }, { status: 400 });
    }

    // Validate questions
    for (const q of questions) {
      if (!q || typeof q.text !== "string" || !Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { error: "Each question must have text and at least 2 options" },
          { status: 400 }
        );
      }
      if (typeof q.correctIdx !== "number" || q.correctIdx < 0 || q.correctIdx >= q.options.length) {
        return NextResponse.json(
          { error: "Each question must have a valid correct answer index" },
          { status: 400 }
        );
      }
    }

    // Verify ownership and get quiz
    const lecture = await prisma.lecture.findFirst({
      where: {
        id: lectureId,
        courseId: courseId,
        type: "QUIZ",
        course: { instructorId: user.id }
      },
      include: { quiz: true }
    });

    if (!lecture || !lecture.quiz) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    // Delete existing questions and create new ones in a single transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.question.deleteMany({
        where: { quizId: lecture.quiz!.id }
      });

      await tx.question.createMany({
        data: questions.map((q: QuestionData) => ({
          quizId: lecture.quiz!.id,
          text: q.text.trim(),
          options: q.options,
          correctIdx: q.correctIdx
        }))
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST quiz error:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}
