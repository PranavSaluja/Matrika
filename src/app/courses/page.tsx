"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image"; 

type Course = {
  id: number;
  title: string;
  description: string;
  instructor: { email: string };
  _count: { lectures: number };
  createdAt: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then(data => setCourses(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-300 rounded-full hover:bg-orange-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Using a placeholder div for logo, replace with <Image src="/logo.png" ... /> if you have it */}
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            {/* <Image src="/logo.png" alt="Matrika" width={40} height={40} className="rounded-lg" /> */}
            <span className="text-xl font-semibold text-gray-800">Matrika</span>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Courses</h1>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No courses available yet.</p>
            <p className="text-gray-500">Check back later for new courses!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>By <span className="font-medium">{course.instructor.email.split('@')[0]}</span></span>
                  <span>{course._count.lectures} lectures</span>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="block w-full text-center bg-orange-300 hover:bg-orange-400 text-gray-800 py-3 rounded-full transition-colors font-medium"
                >
                  View Course
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}