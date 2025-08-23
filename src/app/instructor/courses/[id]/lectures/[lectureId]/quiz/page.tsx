// src/app/instructor/courses/[id]/lectures/[lectureId]/quiz/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIdx: number;
}

interface QuestionForm {
  text: string;
  options: string[];
  correctIdx: number;
}

interface Lecture {
  id: number;
  title: string;
  type: string;
  quiz?: {
    id: number;
    passPct: number;
    questions: Question[];
  };
}

export default function ManageQuizPage() {
  const router = useRouter();
  const params = useParams<{ id: string; lectureId: string }>();
  const courseId = params.id;
  const lectureId = params.lectureId;

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  useEffect(() => {
    if (!courseId || !lectureId) {
      router.push("/dashboard");
      return;
    }

    fetch(`/api/instructor/courses/${courseId}/lectures/${lectureId}/quiz`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch quiz");
        return res.json();
      })
      .then((data: Lecture) => {
        setLecture(data);
        if (data.quiz?.questions) {
          setQuestions(
            data.quiz.questions.map((q) => ({
              text: q.text,
              options: [...q.options],
              correctIdx: q.correctIdx,
            })),
          );
        } else {
          // Initialize with one empty question
          setQuestions([
            {
              text: "",
              options: ["", ""],
              correctIdx: 0,
            },
          ]);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to fetch quiz");
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [courseId, lectureId, router]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", ""],
        correctIdx: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Typed updateQuestion: value matches the field's type
  const updateQuestion = <T extends keyof QuestionForm>(
    index: number,
    field: T,
    value: QuestionForm[T],
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      // Adjust correctIdx if needed
      if (updated[questionIndex].correctIdx >= optionIndex) {
        updated[questionIndex].correctIdx = Math.max(
          0,
          updated[questionIndex].correctIdx - 1,
        );
      }
      setQuestions(updated);
    }
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} must have text`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/instructor/courses/${courseId}/lectures/${lectureId}/quiz`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ questions }),
        },
      );

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to save quiz");
      }

      router.push(`/instructor/courses/${courseId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Quiz not found"}</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-orange-300 rounded-full hover:bg-orange-400"
          >
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
          <Link
            href={`/instructor/courses/${courseId}`}
            className="text-purple-600 hover:text-purple-800"
          >
            ← Back to Course
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Manage Quiz: {lecture.title}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter question text"
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(qIndex, "text", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options:
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctIdx === oIndex}
                        onChange={() =>
                          updateQuestion(qIndex, "correctIdx", oIndex)
                        }
                        className="w-4 h-4 text-purple-600"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(qIndex)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={addQuestion}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full font-medium transition-colors"
            >
              + Add Question
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-300 hover:bg-orange-400 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
