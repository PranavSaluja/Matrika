// src/app/api/courses/[id]/lectures/route.ts (updated with proper types)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

interface QuestionData {
  text: string;
  options: string[];
  correctIdx: number;
}

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
    const { type, title, content, link, questions }: {
      type: string;
      title: string;
      content?: string;
      link?: string;
      questions?: QuestionData[];
    } = body;

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
    }

    if (type !== "READING" && type !== "QUIZ") {
      return NextResponse.json({ error: "Type must be READING or QUIZ" }, { status: 400 });
    }

    // For quiz, validate questions
    if (type === "QUIZ") {
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "Quiz must have at least one question" }, { status: 400 });
      }

      // Validate each question
      for (const q of questions) {
        if (!q.text || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
          return NextResponse.json({ error: "Each question must have text and at least 2 options" }, { status: 400 });
        }
        if (typeof q.correctIdx !== 'number' || q.correctIdx < 0 || q.correctIdx >= q.options.length) {
          return NextResponse.json({ error: "Each question must have a valid correct answer index" }, { status: 400 });
        }
      }
    }

    // Get next order number
    const lastLecture = await prisma.lecture.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });

    const nextOrder = (lastLecture?.order || 0) + 1;

    // Create lecture with transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lecture = await tx.lecture.create({
        data: {
          courseId,
          type,
          title: title.trim(),
          content: content?.trim() || null,
          link: link?.trim() || null,
          order: nextOrder
        }
      });

      // If it's a quiz, create the quiz record and questions
      if (type === "QUIZ" && questions) {
        const quiz = await tx.quiz.create({
          data: {
            lectureId: lecture.id,
            passPct: 70 // default passing percentage
          }
        });

        // Create questions
        await tx.question.createMany({
          data: questions.map((q: QuestionData) => ({
            quizId: quiz.id,
            text: q.text.trim(),
            options: q.options,
            correctIdx: q.correctIdx
          }))
        });
      }

      return lecture;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/[id]/lectures error:", error);
    return NextResponse.json({ error: "Failed to create lecture" }, { status: 500 });
  }
}