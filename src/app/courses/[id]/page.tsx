// src/app/courses/[id]/page.tsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation"; // <--- Add useParams here

type Progress = {
  completed: boolean;
  score?: number;
};

type Lecture = {
  id: number;
  title: string;
  type: "READING" | "QUIZ";
  order: number;
  progress: Progress[];
};

type Course = {
  id: number;
  title: string;
  description: string;
  instructor: { email: string };
  lectures: Lecture[];
};

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams(); // Now useParams is recognized
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if courseId is valid
    if (!courseId) {
      router.push("/courses"); // Redirect if no course ID is provided
      return;
    }

    fetch(`/api/courses/${courseId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Course not found.");
          throw new Error("Failed to fetch course details.");
        }
        return res.json();
      })
      .then(data => setCourse(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId, router]); // Add router to dependency array as it's used inside useEffect

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">Error: {error || "Course not found"}</p>
          <Link href="/courses" className="px-4 py-2 bg-orange-300 rounded-full hover:bg-orange-400">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const completedLectures = course.lectures.filter(lecture =>
    lecture.progress.length > 0 && lecture.progress[0].completed
  ).length;

  const progressPercentage = course.lectures.length > 0
    ? Math.round((completedLectures / course.lectures.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/courses" className="text-purple-600 hover:text-purple-800">
            ← Back to Courses
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-semibold">Matrika</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
            <span>By {course.instructor.email.split('@')[0]}</span>
            <span>{course.lectures.length} lectures</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completedLectures}/{course.lectures.length} completed ({progressPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Lectures List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Lectures</h2>

          {course.lectures.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No lectures available yet.</p>
          ) : (
            <div className="space-y-4">
              {course.lectures.map((lecture, index) => {
                const isCompleted = lecture.progress.length > 0 && lecture.progress[0].completed;
                // Add explicit type to prevLecture
                const canAccess = index === 0 || (
                  index > 0 && course.lectures[index - 1].progress.length > 0 && course.lectures[index - 1].progress[0].completed
                );

                return (
                  <div
                    key={lecture.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isCompleted ? 'bg-green-50 border-green-200' :
                      canAccess ? 'bg-white border-gray-200 hover:border-purple-300' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted ? 'bg-green-500 text-white' :
                          canAccess ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-300 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{lecture.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              lecture.type === 'QUIZ' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {lecture.type}
                            </span>
                            {isCompleted && lecture.progress[0].score && (
                              <span className="text-green-600">Score: {lecture.progress[0].score}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {canAccess ? (
                        <Link
                          href={`/courses/${course.id}/lectures/${lecture.id}`}
                          className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                          {isCompleted ? 'Review' : 'Start'}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}