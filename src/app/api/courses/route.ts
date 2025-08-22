import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUser(); // reads JWT from HttpOnly cookie
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description } = await req.json().catch(() => ({}));

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
