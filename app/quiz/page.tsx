"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase, QuizQuestion, MemberRanking } from "@/lib/supabase";

type MainTab = "quiz" | "ranking";
type QuizStatus = "none" | "active" | "soon";

type QuizDay = {
  id: string;
  label: string;
  date: string;
  dateObj: Date;
};

// Trip dates (Bali timezone UTC+8)
const tripDates = [
  { id: "day1", label: "Day 1", date: "Dec 22", dateObj: new Date("2025-12-22T00:00:00+08:00") },
  { id: "day2", label: "Day 2", date: "Dec 23", dateObj: new Date("2025-12-23T00:00:00+08:00") },
  { id: "day3", label: "Day 3", date: "Dec 24", dateObj: new Date("2025-12-24T00:00:00+08:00") },
  { id: "day4", label: "Day 4", date: "Dec 25", dateObj: new Date("2025-12-25T00:00:00+08:00") },
  { id: "day5", label: "Day 5", date: "Dec 26", dateObj: new Date("2025-12-26T00:00:00+08:00") },
  { id: "day6", label: "Day 6", date: "Dec 27", dateObj: new Date("2025-12-27T00:00:00+08:00") },
];

// Get quiz status based on current date
function getQuizStatus(dayDate: Date): QuizStatus {
  const now = new Date();
  const dayStart = new Date(dayDate);
  const dayEnd = new Date(dayDate);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Day 1 has no quiz (arrival day)
  if (dayDate.getDate() === 22) return "none";

  // Quiz is active on the day itself
  if (now >= dayStart && now < dayEnd) return "active";

  // Past days are closed (none)
  if (now >= dayEnd) return "none";

  // Future days are coming soon
  return "soon";
}

// Build quiz days with dynamic status
function getQuizDays(): (QuizDay & { status: QuizStatus })[] {
  return tripDates.map((day) => ({
    ...day,
    status: getQuizStatus(day.dateObj),
  }));
}

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}

function QuizContent() {
  const { member } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("quiz");

  // Get quiz days with dynamic status based on current date
  const quizDays = getQuizDays();

  const [activeDay, setActiveDay] = useState(() => {
    const days = getQuizDays();
    const activeIndex = days.findIndex((day) => day.status === "active");
    return Math.max(activeIndex, 0);
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<string, { answer: string; is_correct: boolean | null }>
  >({});
  const [rankings, setRankings] = useState<MemberRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const selectedDay = quizDays[activeDay];

  // Fetch questions for selected day
  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("day_id", selectedDay.id)
          .order("id");
        setQuestions(data || []);
      } catch {
        setQuestions([]);
      }
      setIsLoading(false);
    }

    if (selectedDay.status === "active") {
      fetchQuestions();
    } else {
      setQuestions([]);
      setIsLoading(false);
    }
  }, [selectedDay.id, selectedDay.status]);

  // Fetch user's submitted answers
  useEffect(() => {
    async function fetchUserAnswers() {
      if (!member) return;

      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from("quiz_answers")
          .select("question_id, answer, is_correct")
          .eq("member_id", member.id);

        const answersMap: Record<
          string,
          { answer: string; is_correct: boolean | null }
        > = {};
        data?.forEach((a) => {
          answersMap[a.question_id] = {
            answer: a.answer,
            is_correct: a.is_correct,
          };
        });
        setSubmittedAnswers(answersMap);
      } catch {
        // Supabase not configured
      }
    }

    fetchUserAnswers();
  }, [member]);

  // Fetch rankings
  useEffect(() => {
    async function fetchRankings() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from("member_rankings")
          .select("*")
          .order("total_points", { ascending: false });
        setRankings(data || []);
      } catch {
        setRankings([]);
      }
    }

    if (activeTab === "ranking") {
      fetchRankings();
    }
  }, [activeTab]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (questionId: string) => {
    if (!member || !answers[questionId]) return;

    setIsSubmitting(questionId);
    setSubmitMessage(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("quiz_answers").upsert(
        {
          member_id: member.id,
          question_id: questionId,
          answer: answers[questionId],
          is_correct: null,
          points_earned: 0,
        },
        { onConflict: "member_id,question_id" }
      );

      if (error) {
        setSubmitMessage("Failed to submit. Try again.");
      } else {
        setSubmittedAnswers((prev) => ({
          ...prev,
          [questionId]: { answer: answers[questionId], is_correct: null },
        }));
        setSubmitMessage("Answer submitted!");
        setAnswers((prev) => {
          const copy = { ...prev };
          delete copy[questionId];
          return copy;
        });
      }
    } catch {
      setSubmitMessage("Connection error. Try again.");
    }

    setIsSubmitting(null);
    setTimeout(() => setSubmitMessage(null), 3000);
  };

  const statusLabel =
    selectedDay.status === "active"
      ? "Open"
      : selectedDay.status === "none"
        ? "Closed"
        : "Coming soon";

  const statusClass =
    selectedDay.status === "active"
      ? "bg-[#436c34]/20 text-[#436c34]"
      : selectedDay.status === "none"
        ? "bg-gray-200 text-gray-600"
        : "bg-[#ff8522]/20 text-[#ff8522]";

  const statusMessage =
    selectedDay.status === "active"
      ? `Voting open for ${selectedDay.label}`
      : selectedDay.status === "none"
        ? `No quiz for ${selectedDay.label}`
        : "Quiz will open soon";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#fa655f] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">🧠 我猜我猜我猜猜猜</h1>
            <p className="text-sm opacity-90">Guess & Win</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              {member?.emoji || member?.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Tab Switcher */}
        <div className="bg-white/10 rounded-full p-1 flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "quiz"
                ? "bg-[#fa655f] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "ranking"
                ? "bg-[#ff8522] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Ranking
          </button>
        </div>

        {activeTab === "quiz" ? (
          <div>
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
              {quizDays.map((day, index) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(index)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    activeDay === index
                      ? "bg-[#00b4fb] text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* Day Info */}
            <div className="mb-4 bg-white/10 rounded-2xl p-4">
              <p className="text-xs text-white/60">{selectedDay.date}</p>
              <div className="flex items-center justify-between mt-1">
                <h2 className="text-lg font-bold text-white">
                  {selectedDay.label} Quiz
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-white/70">{statusMessage}</p>
            </div>

            {submitMessage && (
              <div className="mb-4 p-3 bg-[#436c34]/20 text-[#436c34] rounded-lg text-sm text-center border border-[#436c34]/30">
                {submitMessage}
              </div>
            )}

            {selectedDay.status === "active" ? (
              isLoading ? (
                <div className="text-center py-8 text-white/60">
                  Loading questions...
                </div>
              ) : questions.length === 0 ? (
                <div className="bg-white/10 rounded-2xl p-6 text-center text-white/60">
                  No questions for this day yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const submitted = submittedAnswers[question.id];
                    const isAnswered = !!submitted;

                    return (
                      <div
                        key={question.id}
                        className={`bg-white rounded-2xl shadow-md p-4 ${
                          isAnswered ? "ring-2 ring-[#436c34]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Question {index + 1}</span>
                          <div className="flex gap-2">
                            {isAnswered && (
                              <span className="rounded-full bg-[#436c34]/20 text-[#436c34] px-2 py-0.5 text-xs font-medium">
                                Answered
                              </span>
                            )}
                            <span className="rounded-full bg-[#fa655f]/20 text-[#fa655f] px-2 py-0.5 text-xs font-medium">
                              {question.type === "mc"
                                ? "Multiple Choice"
                                : "Number"}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 font-semibold text-[#011a42]">
                          {question.prompt}
                        </p>

                        {isAnswered ? (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Your answer:{" "}
                              <span className="font-medium">
                                {submitted.answer}
                              </span>
                            </p>
                            {submitted.is_correct !== null && (
                              <p
                                className={`text-sm mt-1 ${submitted.is_correct ? "text-[#436c34]" : "text-[#fa655f]"}`}
                              >
                                {submitted.is_correct
                                  ? "✓ Correct!"
                                  : "✗ Incorrect"}
                              </p>
                            )}
                          </div>
                        ) : question.type === "mc" && question.options ? (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={answers[question.id] === option}
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question.id,
                                      e.target.value
                                    )
                                  }
                                  className="h-4 w-4 accent-[#fa655f]"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              value={answers[question.id] || ""}
                              onChange={(e) =>
                                handleAnswerChange(
                                  question.id,
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              placeholder="00"
                              className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#00b4fb] focus:outline-none text-center"
                            />
                            <span className="text-xs text-gray-500">
                              2-digit answer
                            </span>
                          </div>
                        )}

                        {!isAnswered && (
                          <button
                            onClick={() => handleSubmit(question.id)}
                            disabled={
                              !answers[question.id] ||
                              isSubmitting === question.id
                            }
                            className="mt-4 w-full py-2 bg-[#fa655f] hover:bg-[#e5524e] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSubmitting === question.id
                              ? "Submitting..."
                              : "Submit Answer"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="bg-white/10 rounded-2xl p-6 text-center text-white/60">
                {selectedDay.status === "none"
                  ? `No quiz for ${selectedDay.label}.`
                  : "Coming soon."}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                No rankings yet. Answer questions to earn points!
              </div>
            ) : (
              rankings.map((player, index) => (
                <div
                  key={player.id}
                  className={`bg-white rounded-2xl shadow-md p-3 flex items-center justify-between ${
                    player.id === member?.id ? "ring-2 ring-[#00b4fb]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0
                          ? "bg-[#ff8522]"
                          : index === 1
                            ? "bg-gray-400"
                            : index === 2
                              ? "bg-amber-600"
                              : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {/* Avatar - emoji or initial */}
                    <div className="w-10 h-10 rounded-full bg-[#00b4fb] flex items-center justify-center text-xl shadow-sm">
                      {player.emoji || (
                        <span className="text-white font-bold text-sm">
                          {player.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#011a42]">
                        {player.name}
                        {player.id === member?.id && (
                          <span className="text-xs text-[#00b4fb] ml-1">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.correct_answers}/{player.total_answers} correct
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#ff8522]">
                    {player.total_points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
