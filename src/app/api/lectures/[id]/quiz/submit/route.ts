// src/app/api/lectures/[id]/quiz/submit/route.ts (updated with proper types)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

interface QuizAnswers {
  [questionId: string]: number;
}

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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const lectureId = parseInt(params.id);

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(lectureId)) {
      return NextResponse.json({ error: "Invalid lecture ID" }, { status: 400 });
    }

    const body = await req.json();
    const { answers }: { answers: QuizAnswers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        course: true,
        quiz: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    if (lecture.type !== "QUIZ" || !lecture.quiz) {
      return NextResponse.json({ error: "This is not a quiz lecture" }, { status: 400 });
    }

    // Check if previous lectures are completed
    const previousLectures: LectureWithProgress[] = await prisma.lecture.findMany({
      where: {
        courseId: lecture.courseId,
        order: { lt: lecture.order }
      },
      include: {
        progress: {
          where: { studentId: user.id },
          select: { completed: true }
        }
      }
    });

    const allPreviousCompleted = previousLectures.every((prevLecture: LectureWithProgress) => 
      prevLecture.progress.length > 0 && prevLecture.progress[0].completed
    );

    if (!allPreviousCompleted && lecture.order > 1) {
      return NextResponse.json({ error: "Complete previous lectures first" }, { status: 403 });
    }

    // Grade the quiz
    const questions = lecture.quiz.questions;
    let correctAnswers = 0;

    for (const question of questions) {
      const studentAnswer = answers[question.id.toString()];
      if (typeof studentAnswer === 'number' && studentAnswer === question.correctIdx) {
        correctAnswers++;
      }
    }

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= lecture.quiz.passPct;

    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        studentId_lectureId: {
          studentId: user.id,
          lectureId: lectureId
        }
      },
      update: {
        completed: passed,
        score: score
      },
      create: {
        studentId: user.id,
        lectureId: lectureId,
        completed: passed,
        score: score
      }
    });

    return NextResponse.json({
      score,
      passed,
      correctAnswers,
      totalQuestions: questions.length,
      passingScore: lecture.quiz.passPct,
      progress
    });
  } catch (error) {
    console.error("POST /api/lectures/[id]/quiz/submit error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}