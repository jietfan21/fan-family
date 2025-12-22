"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { QuizQuestion } from "@/lib/supabase";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from "lucide-react";

type QuestionForm = {
  prompt: string;
  type: "mc" | "number";
  options: string[];
  is_prediction: boolean;
  answer_type: "exact" | "range";
  correct_answer: string;
  answer_min: string;
  answer_max: string;
  release_date: string;
  release_time: string;
  end_date: string;
  end_time: string;
};

const DAYS = [
  { id: "day1", label: "Day 1 - Dec 22", date: "2025-12-22" },
  { id: "day2", label: "Day 2 - Dec 23", date: "2025-12-23" },
  { id: "day3", label: "Day 3 - Dec 24", date: "2025-12-24" },
  { id: "day4", label: "Day 4 - Dec 25", date: "2025-12-25" },
  { id: "day5", label: "Day 5 - Dec 26", date: "2025-12-26" },
  { id: "day6", label: "Day 6 - Dec 27", date: "2025-12-27" },
];

export default function AdminPage() {
  const { member } = useAuth();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState("day2");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [formData, setFormData] = useState<QuestionForm>({
    prompt: "",
    type: "mc",
    options: ["", "", "", ""],
    is_prediction: false,
    answer_type: "exact",
    correct_answer: "",
    answer_min: "",
    answer_max: "",
    release_date: "2025-12-23",
    release_time: "09:00",
    end_date: "2025-12-23",
    end_time: "23:00",
  });

  const supabase = getSupabase();

  // Check if user is dev
  useEffect(() => {
    if (!member) {
      router.push("/login");
      return;
    }
    if (!member.is_dev) {
      router.push("/");
      return;
    }
  }, [member, router]);

  // Load questions for selected day
  useEffect(() => {
    loadQuestions();
  }, [selectedDay]);

  const loadQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("day_id", selectedDay)
      .order("created_at");

    if (!error && data) {
      setQuestions(data as QuizQuestion[]);
    }
    setLoading(false);
  };

  const validateDateTime = () => {
    // Build full datetime objects
    const releaseDateTime = new Date(`${formData.release_date}T${formData.release_time}:00+08:00`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}:00+08:00`);
    const now = new Date();

    // Check if release time is in the past
    if (releaseDateTime < now) {
      alert("Release time cannot be in the past");
      return false;
    }

    // Check if end time is before release time
    if (endDateTime <= releaseDateTime) {
      alert("End time must be after release time");
      return false;
    }

    return true;
  };

  const handleAddQuestion = async () => {
    // Validate date/time first
    if (!validateDateTime()) {
      return;
    }

    const selectedDayData = DAYS.find((d) => d.id === selectedDay);
    if (!selectedDayData) return;

    // Build release/end timestamps (Bali timezone UTC+8)
    const releaseTimestamp = `${formData.release_date}T${formData.release_time}:00+08:00`;
    const endTimestamp = `${formData.end_date}T${formData.end_time}:00+08:00`;

    // Generate a unique ID for the question
    const questionId = `${selectedDay}_q${Date.now()}`;

    const questionData: any = {
      id: questionId,
      day_id: selectedDay,
      prompt: formData.prompt,
      type: formData.type,
      is_prediction: formData.is_prediction,
      points: 1,
      release_time: releaseTimestamp,
      end_time: endTimestamp,
    };

    // Handle MC options
    if (formData.type === "mc") {
      questionData.options = formData.options.filter((o) => o.trim() !== "");
      if (!formData.is_prediction) {
        questionData.correct_answer = formData.correct_answer;
      }
    }

    // Handle number type
    if (formData.type === "number") {
      questionData.answer_type = formData.answer_type;
      if (formData.answer_type === "exact") {
        if (!formData.is_prediction) {
          questionData.correct_answer = formData.correct_answer;
        }
      } else {
        // Range type
        questionData.answer_min = parseInt(formData.answer_min);
        questionData.answer_max = parseInt(formData.answer_max);
        questionData.correct_answer = formData.answer_min; // Store min as correct_answer for consistency
      }
    }

    const { error } = await supabase.from("quiz_questions").insert([questionData]);

    if (!error) {
      setShowAddForm(false);
      resetForm();
      loadQuestions();
    } else {
      alert("Error adding question: " + error.message);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    // Validate date/time first
    if (!validateDateTime()) {
      return;
    }

    const updateData: any = {
      prompt: formData.prompt,
      release_time: `${formData.release_date}T${formData.release_time}:00+08:00`,
      end_time: `${formData.end_date}T${formData.end_time}:00+08:00`,
    };

    // Only update answer if not prediction or if setting answer
    if (formData.type === "mc") {
      updateData.options = formData.options.filter((o) => o.trim() !== "");
      if (formData.correct_answer) {
        updateData.correct_answer = formData.correct_answer;
      }
    }

    if (formData.type === "number") {
      if (formData.answer_type === "exact" && formData.correct_answer) {
        updateData.correct_answer = formData.correct_answer;
      } else if (formData.answer_type === "range") {
        updateData.answer_min = parseInt(formData.answer_min);
        updateData.answer_max = parseInt(formData.answer_max);
      }
    }

    const { error } = await supabase
      .from("quiz_questions")
      .update(updateData)
      .eq("id", editingQuestion.id);

    if (!error) {
      // If correct_answer was set, trigger grading
      if (updateData.correct_answer) {
        await supabase.rpc("grade_question", { question_uuid: editingQuestion.id });
      }

      setEditingQuestion(null);
      resetForm();
      loadQuestions();
    } else {
      alert("Error updating question: " + error.message);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? This will remove all user answers and points earned from this question.")) return;

    // First, delete all answers to this question
    await supabase.from("quiz_answers").delete().eq("question_id", questionId);

    // Then delete the question itself
    const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);

    if (!error) {
      loadQuestions();
    } else {
      alert("Error deleting question: " + error.message);
    }
  };

  const startEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);

    // Extract release/end date and time
    let relDate = "2025-12-23";
    let relTime = "09:00";
    let endDate = "2025-12-23";
    let endTime = "23:00";

    if (question.release_time) {
      const release = new Date(question.release_time);
      relDate = release.toISOString().split('T')[0];
      relTime = `${release.getHours().toString().padStart(2, "0")}:${release.getMinutes().toString().padStart(2, "0")}`;
    }

    if (question.end_time) {
      const end = new Date(question.end_time);
      endDate = end.toISOString().split('T')[0];
      endTime = `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
    }

    setFormData({
      prompt: question.prompt,
      type: question.type,
      options: question.options || ["", "", "", ""],
      is_prediction: question.is_prediction,
      answer_type: question.answer_type,
      correct_answer: question.correct_answer || "",
      answer_min: question.answer_min?.toString() || "",
      answer_max: question.answer_max?.toString() || "",
      release_date: relDate,
      release_time: relTime,
      end_date: endDate,
      end_time: endTime,
    });
  };

  const resetForm = () => {
    setFormData({
      prompt: "",
      type: "mc",
      options: ["", "", "", ""],
      is_prediction: false,
      answer_type: "exact",
      correct_answer: "",
      answer_min: "",
      answer_max: "",
      release_date: "2025-12-23",
      release_time: "09:00",
      end_date: "2025-12-23",
      end_time: "23:00",
    });
  };

  const canEditQuestion = (question: QuizQuestion) => {
    if (!question.release_time) return true;
    return new Date(question.release_time) > new Date();
  };

  if (!member?.is_dev) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/quiz")}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <h1 className="text-3xl font-bold text-black">Quiz Admin Panel</h1>
        </div>

        {/* Day Selector */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium mb-2 text-black">Select Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full p-2 border rounded-lg text-black"
          >
            {DAYS.map((day) => (
              <option key={day.id} value={day.id}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-black">
              Questions ({questions.length})
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No questions yet</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-black">Q{idx + 1}.</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-black">
                          {q.type === "mc" ? "Multiple Choice" : "Number"}
                        </span>
                        {q.is_prediction && (
                          <span className="text-xs bg-yellow-100 px-2 py-1 rounded text-black">
                            Prediction
                          </span>
                        )}
                        {q.correct_answer && (
                          <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                            Answered
                          </span>
                        )}
                      </div>
                      <p className="mb-2 text-black">{q.prompt}</p>
                      {q.type === "mc" && q.options && (
                        <div className="text-sm text-gray-600">
                          Options: {q.options.join(", ")}
                        </div>
                      )}
                      {q.type === "number" && q.answer_type === "range" && (
                        <div className="text-sm text-gray-600">
                          Range: {q.answer_min} - {q.answer_max}
                        </div>
                      )}
                      {q.correct_answer && (
                        <div className="text-sm font-medium text-green-600 mt-1">
                          Correct: {q.correct_answer}
                        </div>
                      )}
                      {q.release_time && q.end_time && (
                        <div className="text-xs text-gray-500 mt-2">
                          📅 {new Date(q.release_time).toLocaleString('en-US', {
                            timeZone: 'Asia/Singapore',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(q.end_time).toLocaleString('en-US', {
                            timeZone: 'Asia/Singapore',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canEditQuestion(q) && (
                        <button
                          onClick={() => startEdit(q)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {!canEditQuestion(q) && q.is_prediction && !q.correct_answer && (
                        <button
                          onClick={() => startEdit(q)}
                          className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        >
                          Set Answer
                        </button>
                      )}
                      {/* Delete button always visible for admin */}
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingQuestion) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black">
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Question</label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="w-full p-2 border rounded-lg text-black"
                    rows={3}
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Question Type */}
                {!editingQuestion && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Question Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-black">
                        <input
                          type="radio"
                          checked={formData.type === "mc"}
                          onChange={() => setFormData({ ...formData, type: "mc" })}
                          className="mr-2"
                        />
                        Multiple Choice
                      </label>
                      <label className="flex items-center text-black">
                        <input
                          type="radio"
                          checked={formData.type === "number"}
                          onChange={() => setFormData({ ...formData, type: "number" })}
                          className="mr-2"
                        />
                        2-Digit Number
                      </label>
                    </div>
                  </div>
                )}

                {/* MC Options */}
                {formData.type === "mc" && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Options</label>
                    {formData.options.map((opt, idx) => (
                      <input
                        key={idx}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[idx] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="w-full p-2 border rounded-lg mb-2 text-black"
                        placeholder={`Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Number Answer Type */}
                {formData.type === "number" && !editingQuestion && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Answer Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-black">
                        <input
                          type="radio"
                          checked={formData.answer_type === "exact"}
                          onChange={() => setFormData({ ...formData, answer_type: "exact" })}
                          className="mr-2"
                        />
                        Exact Number
                      </label>
                      <label className="flex items-center text-black">
                        <input
                          type="radio"
                          checked={formData.answer_type === "range"}
                          onChange={() => setFormData({ ...formData, answer_type: "range" })}
                          className="mr-2"
                        />
                        Range
                      </label>
                    </div>
                  </div>
                )}

                {/* Range Inputs */}
                {formData.type === "number" && formData.answer_type === "range" && !editingQuestion && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Min</label>
                      <input
                        type="number"
                        value={formData.answer_min}
                        onChange={(e) => setFormData({ ...formData, answer_min: e.target.value })}
                        className="w-full p-2 border rounded-lg text-black"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Max</label>
                      <input
                        type="number"
                        value={formData.answer_max}
                        onChange={(e) => setFormData({ ...formData, answer_max: e.target.value })}
                        className="w-full p-2 border rounded-lg text-black"
                        min="0"
                        max="99"
                      />
                    </div>
                  </div>
                )}

                {/* Prediction Toggle */}
                {!editingQuestion && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_prediction}
                        onChange={(e) =>
                          setFormData({ ...formData, is_prediction: e.target.checked })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-black">
                        Prediction Question (set answer later)
                      </span>
                    </label>
                  </div>
                )}

                {/* Correct Answer */}
                {((formData.type === "mc" && !formData.is_prediction) ||
                  (formData.type === "number" &&
                    formData.answer_type === "exact" &&
                    !formData.is_prediction) ||
                  editingQuestion) && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">
                      {editingQuestion && editingQuestion.is_prediction
                        ? "Set Correct Answer"
                        : "Correct Answer"}
                    </label>
                    {formData.type === "mc" ? (
                      <select
                        value={formData.correct_answer}
                        onChange={(e) =>
                          setFormData({ ...formData, correct_answer: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg text-black"
                      >
                        <option value="">Select correct answer...</option>
                        {formData.options
                          .filter((o) => o.trim() !== "")
                          .map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={formData.correct_answer}
                        onChange={(e) =>
                          setFormData({ ...formData, correct_answer: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg text-black"
                        min="0"
                        max="99"
                        placeholder="Enter 2-digit number"
                      />
                    )}
                  </div>
                )}

                {/* Question Timing */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3 text-black">Question Timing (Bali Time UTC+8)</h3>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm mb-1 text-black">Release Date</label>
                      <input
                        type="date"
                        value={formData.release_date}
                        onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                        className="w-full p-2 border rounded-lg text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-black">Release Time</label>
                      <input
                        type="time"
                        value={formData.release_time}
                        onChange={(e) => setFormData({ ...formData, release_time: e.target.value })}
                        className="w-full p-2 border rounded-lg text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 text-black">End Date</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full p-2 border rounded-lg text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-black">End Time</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full p-2 border rounded-lg text-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Save className="w-4 h-4" />
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingQuestion(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
