// src/app/instructor/courses/new/page.tsx (Corrected)
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Role = "INSTRUCTOR" | "STUDENT";
// Changed id to number
type Me = { id: number; role: Role; email?: string };
type MeResponse = Me | { error: string };

type CreateCourseSuccess = {
  id: number; // Changed to number
  title: string;
  description: string;
  instructorId: number; // Changed to number
  createdAt: string;
};
type CreateCourseError = { error: string };
type CreateCourseResponse = CreateCourseSuccess | CreateCourseError;

function isMe(x: MeResponse): x is Me {
  // This is the corrected line
  return typeof (x as Me)?.id === "number" && (x as Me)?.role !== undefined;
}

function isCreateSuccess(x: CreateCourseResponse): x is CreateCourseSuccess {
  // Also correct this one
  return typeof (x as CreateCourseSuccess)?.id === "number";
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return "Something went wrong"; }
}

export default function NewCoursePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data: MeResponse = await res.json();
        if (res.ok && isMe(data)) setMe(data);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description }),
      });
      const data: CreateCourseResponse = await res.json();
      if (!res.ok) {
        const errMsg = "error" in data && data.error ? data.error : "Failed to create course";
        throw new Error(errMsg);
      }
      if (isCreateSuccess(data)) {
        setMsg(`Created course: ${data.title} (id: ${data.id})`);
        setTitle("");
        setDescription("");
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err: unknown) {
      setMsg(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full opacity-30 -translate-x-24 -translate-y-24"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full opacity-30 translate-x-32 translate-y-32"></div>
        
        {/* Logo */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Matrika Logo" 
              width={65} 
              height={65}
              className="rounded-lg"
            />
            <span className="text-2xl font-semibold text-gray-800">Matrika</span>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
          <p className="text-center text-gray-600">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full opacity-30 -translate-x-24 -translate-y-24"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full opacity-30 translate-x-32 translate-y-32"></div>
        
        {/* Logo */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Matrika Logo" 
              width={65} 
              height={65}
              className="rounded-lg"
            />
            <span className="text-2xl font-semibold text-gray-800">Matrika</span>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-center">
          <p className="text-gray-600 mb-4">Please log in as an instructor.</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-orange-300 text-gray-800 rounded-full hover:bg-orange-400 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (me.role !== "INSTRUCTOR") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full opacity-30 -translate-x-24 -translate-y-24"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full opacity-30 translate-x-32 translate-y-32"></div>
        
        {/* Logo */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Matrika Logo" 
              width={65} 
              height={65}
              className="rounded-lg"
            />
            <span className="text-2xl font-semibold text-gray-800">Matrika</span>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-center">
          <p className="text-red-600 mb-4">Forbidden: Instructor role required.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-orange-300 text-gray-800 rounded-full hover:bg-orange-400 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full opacity-30 -translate-x-24 -translate-y-24"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full opacity-30 translate-x-32 translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300 rounded-full opacity-40 -translate-x-16 translate-y-16"></div>

      {/* Logo */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="Matrika Logo" 
            width={65} 
            height={65}
            className="rounded-lg"
          />
          <span className="text-2xl font-semibold text-gray-800">Matrika</span>
        </div>
      </div>

      {/* Create Course Form */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative z-10">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Course</h1>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <input
              className="w-full border-2 border-gray-200 rounded-full px-5 py-3 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <textarea
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors min-h-[120px] resize-none"
              placeholder="Course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-orange-300 hover:bg-orange-400 text-gray-800 font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create Course"}
          </button>

          {msg && <p className="text-sm text-center text-green-600">{msg}</p>}
        </form>

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}