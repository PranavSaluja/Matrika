// src/app/instructor/courses/[id]/page.tsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation"; // Import useParams

type Lecture = {
  id: number;
  title: string;
  type: "READING" | "QUIZ";
  content?: string;
  order: number;
};

type Course = {
  id: number;
  title: string;
  description: string;
  lectures: Lecture[];
};

export default function ManageCoursePage() { // Remove params from props
  const router = useRouter();
  const params = useParams(); // Use useParams hook
  const courseId = params.id as string; // Assert type as string

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "READING" as "READING" | "QUIZ",
    title: "",
    content: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if courseId is valid
    if (!courseId) {
      router.push("/dashboard");
      return;
    }

    fetch(`/api/courses/${courseId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Course not found.");
          if (res.status === 401 || res.status === 403) throw new Error("Access denied.");
          throw new Error("Failed to fetch course details.");
        }
        return res.json();
      })
      .then(data => setCourse(data))
      .catch(err => {
        setError(err.message);
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [courseId, router]);

 

const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
  
    try {
      const res = await fetch(`/api/courses/${courseId}/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add lecture.");
      }
  
      const newLecture = await res.json();
      setCourse(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lectures: [...prev.lectures, newLecture].sort((a, b) => a.order - b.order)
        };
      });
  
      setFormData({ type: "READING", title: "", content: "" });
      setShowAddForm(false);
  
      // If it's a quiz, show a message about adding questions
      if (formData.type === "QUIZ") {
        alert("Quiz lecture created! Click 'Manage Quiz' to add questions.");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course management...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Course not found or access denied."}</p>
          <Link href="/dashboard" className="px-4 py-2 bg-orange-300 rounded-full hover:bg-orange-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-purple-600 hover:text-purple-800">
            ← Back to Dashboard
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{course.lectures.length} lectures</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-4 py-2 rounded-full font-medium transition-colors"
            >
              Add Lecture
            </button>
          </div>
        </div>

        {/* Add Lecture Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Lecture</h2>
            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "READING" | "QUIZ" }))}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="READING">Reading</option>
                  <option value="QUIZ">Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    {formData.type === "READING" ? "Content (Text or URL)" : "Description (Optional)"}
  </label>
  <textarea
    value={formData.content}
    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none min-h-[100px]"
    placeholder={formData.type === "READING" ? "Enter reading content or paste a URL..." : "Enter quiz description (optional)..."}
  />
</div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-4 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Lecture"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </form>
          </div>
        )}

        {/* Lectures List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lectures</h2>
          
          {course.lectures.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No lectures yet. Add your first lecture above!</p>
          ) : (
            <div className="space-y-3">
              {course.lectures.map((lecture, index) => (
                <div key={lecture.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{lecture.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lecture.type === "QUIZ" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {lecture.type}
                        </span>
                      </div>
                    </div>
                    {lecture.type === "QUIZ" && (
                      <Link
                        // This path will need to match the new dynamic segment name: [lectureId]
                        href={`/instructor/courses/${courseId}/lectures/${lecture.id}/quiz`}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                      >
                        Manage Quiz
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to get error message (can be global)
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return "Something went wrong"; }
}