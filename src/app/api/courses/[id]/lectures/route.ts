// src/app/api/courses/[id]/lectures/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // FIX 1: Await params
) {
  try {
    const user = await getUser();
    const resolvedParams = await params; // FIX 1: Await params
    const courseId = parseInt(resolvedParams.id); // FIX 1: Await params

    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
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

    const body = await req.json();
    // FIX 2: Re-add `link` since your schema has it
    const { type, title, content, link } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 },
      );
    }

    if (type !== "READING" && type !== "QUIZ") {
      return NextResponse.json(
        { error: "Type must be READING or QUIZ" },
        { status: 400 },
      );
    }

    const lastLecture = await prisma.lecture.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const nextOrder = (lastLecture?.order || 0) + 1;

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const lecture = await tx.lecture.create({
          data: {
            courseId,
            type,
            title: title.trim(),
            content: content?.trim() || null,
            link: link?.trim() || null, // FIX 2: Pass the link to the database
            order: nextOrder,
          },
        });

        if (type === "QUIZ") {
          await tx.quiz.create({
            data: {
              lectureId: lecture.id,
              passPct: 70,
            },
          });
        }

        return lecture;
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/[id]/lectures error:", error);
    return NextResponse.json(
      { error: "Failed to create lecture" },
      { status: 500 },
    );
  }
}