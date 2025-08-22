"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => setCourses(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Matrika" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-semibold">Matrika</span>
          </div>
          <Link href="/login" className="text-purple-600 hover:text-purple-800">
            Login
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Courses</h1>
        
        {courses.length === 0 ? (
          <p className="text-gray-600">No courses available yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>By {course.instructor.email}</span>
                  <span>{course._count.lectures} lectures</span>
                </div>
                <Link 
                  href={`/courses/${course.id}`}
                  className="block w-full text-center bg-orange-300 hover:bg-orange-400 text-gray-800 py-2 rounded-full transition-colors"
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