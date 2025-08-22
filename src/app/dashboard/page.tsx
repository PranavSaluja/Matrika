"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  role: "INSTRUCTOR" | "STUDENT";
};

type Course = {
  id: number;
  title: string;
  description: string;
  _count: { lectures: number };
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is instructor
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.error || data.role !== "INSTRUCTOR") {
          router.push("/login");
          return;
        }
        setUser(data);
        
        // Fetch instructor's courses
        return fetch("/api/instructor/courses", { credentials: "include" });
      })
      .then(res => res?.json())
      .then(data => {
        if (data && !data.error) setCourses(data);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-semibold">Matrika</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.email.split('@')[0]}</span>
            <Link href="/api/auth/logout" className="text-purple-600 hover:text-purple-800">
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
          <Link 
            href="/instructor/courses/new"
            className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors"
          >
            Create New Course
          </Link>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven&#39;t created any courses yet.</p>
            <Link 
              href="/instructor/courses/new"
              className="inline-block bg-orange-300 hover:bg-orange-400 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  {course._count.lectures} lectures
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href={`/instructor/courses/${course.id}`}
                    className="flex-1 text-center bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-full transition-colors text-sm font-medium"
                  >
                    Manage
                  </Link>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="flex-1 text-center bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded-full transition-colors text-sm font-medium"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}