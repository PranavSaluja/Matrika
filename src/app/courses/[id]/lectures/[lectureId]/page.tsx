// src/app/courses/[id]/lectures/[lectureId]/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // NEW: Import the useAuth hook

// ... (keep all your type definitions here: Question, Quiz, Progress, etc.)
type Question = {
  id: number;
  text: string;
  options: string[];
};

type Quiz = {
  id: number;
  passPct: number;
  questions: Question[];
};

type Progress = {
  completed: boolean;
  score?: number;
};

type QuizResult = {
  passed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
};

type Lecture = {
  id: number;
  title: string;
  type: "READING" | "QUIZ";
  content?: string;
  link?: string;
  order: number;
  course: {
    id: number;
    title: string;
  };
  quiz?: Quiz;
  progress?: Progress[];
};


export default function LectureViewerPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth(); // NEW: Get the current user's role
  const courseId = params.id as string;
  const lectureId = params.lectureId as string;

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... (keep all your other state definitions: answers, submitting, etc.)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);


  useEffect(() => {
    if (!lectureId) return;

    fetch(`/api/lectures/${lectureId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch lecture");
        return res.json();
      })
      .then((data) => setLecture(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lectureId]);

  // ... (keep your handleMarkComplete and handleQuizSubmit functions exactly as they are)
  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/lectures/${lectureId}/complete`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to mark complete");

      setLecture((prev) =>
        prev ? { ...prev, progress: [{ completed: true }] } : null,
      );
    } catch (err) {
      alert("Failed to mark lecture as complete");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!lecture?.quiz) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lectures/${lectureId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to submit quiz");

      const result = await res.json();
      setQuizResult(result);

      setLecture((prev) =>
        prev
          ? {
              ...prev,
              progress: [{ completed: result.passed, score: result.score }],
            }
          : null,
      );
    } catch (err) {
      alert("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };


  // Show a single loading state until both lecture and user are fetched
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (error || !lecture) {
    // ... (keep your error handling block)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">
            Error: {error || "Lecture not found"}
          </p>
          <Link
            href={`/courses/${courseId}`}
            className="px-4 py-2 bg-orange-300 rounded-full hover:bg-orange-400"
          >
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = lecture.progress?.[0]?.completed ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* ... (keep your Header JSX) ... */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href={`/courses/${courseId}`}
            className="text-purple-600 hover:text-purple-800"
          >
            ← Back to {lecture.course.title}
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-semibold">Matrika</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* ... (keep your Lecture Header JSX) ... */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">
                {lecture.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  lecture.type === "QUIZ"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {lecture.type}
              </span>
            </div>

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-700 font-medium">
                    Completed
                    {lecture.progress?.[0]?.score != null &&
                      ` - Score: ${lecture.progress[0].score}%`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reading Content */}
          {lecture.type === "READING" && (
            <div>
              {/* ... (keep the content and link JSX) ... */}
              {lecture.content && (
                <div className="prose max-w-none mb-8">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {lecture.content}
                  </div>
                </div>
              )}

              {lecture.link && (
                <div className="mb-8">
                  <a
                    href={lecture.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Open Resource Link →
                  </a>
                </div>
              )}

              {/* THE FIX: Only show this button if the user is a STUDENT */}
              {!isCompleted && user?.role === 'STUDENT' && (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  {markingComplete ? "Marking Complete..." : "Mark as Complete"}
                </button>
              )}
            </div>
          )}

          {/* Quiz Content */}
          {/* ... (keep the entire Quiz Content JSX block, but we'll add one fix inside) ... */}
          {lecture.type === "QUIZ" && lecture.quiz && (
            <div>
              {quizResult ? (
                // ... Quiz Results JSX ...
                <div className="text-center">
                  <div
                    className={`inline-block p-8 rounded-lg mb-6 ${
                      quizResult.passed
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div
                      className={`text-6xl font-bold mb-4 ${
                        quizResult.passed
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {quizResult.score}%
                    </div>
                    <div
                      className={`text-xl font-semibold mb-2 ${
                        quizResult.passed
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {quizResult.passed ? "Passed!" : "Failed"}
                    </div>
                    <div className="text-gray-600">
                      {quizResult.correctAnswers} out of{" "}
                      {quizResult.totalQuestions} correct
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Passing score: {quizResult.passingScore}%
                    </div>
                  </div>

                  {!quizResult.passed && (
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setAnswers({});
                      }}
                      className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              ) : (
                // Quiz Questions
                <div>
                  {/* ... Quiz Questions JSX ... */}
                  <div className="mb-8">
                    <p className="text-gray-600">
                      Answer all questions below. You need {lecture.quiz.passPct}
                      % to pass.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {lecture.quiz.questions.map((question, qIndex) => (
                      <div key={question.id} className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {qIndex + 1}. {question.text}
                        </h3>

                        <div className="space-y-3">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={oIndex}
                                checked={
                                  answers[question.id.toString()] === oIndex
                                }
                                onChange={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [question.id.toString()]: oIndex,
                                  }))
                                }
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* THE FIX: Only show this button if the user is a STUDENT */}
                  <div className="mt-8 text-center">
                    {user?.role === 'STUDENT' && (
                      <>
                        <button
                          onClick={handleQuizSubmit}
                          disabled={
                            submitting ||
                            Object.keys(answers).length !==
                              lecture.quiz.questions.length
                          }
                          className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? "Submitting..." : "Submit Quiz"}
                        </button>

                        {Object.keys(answers).length !==
                          lecture.quiz.questions.length && (
                          <p className="text-sm text-gray-500 mt-2">
                            Please answer all questions before submitting
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}