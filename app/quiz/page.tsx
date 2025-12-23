"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase, QuizQuestion, MemberRankingWithChange } from "@/lib/supabase";
import { Clock, ArrowUp, ArrowDown, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

type MainTab = "quiz" | "ranking";
type QuizStatus = "before_release" | "active" | "ended" | "no_quiz";

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

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}

function QuizContent() {
  const { member } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>("quiz");
  const [activeDay, setActiveDay] = useState(1); // Default to day 2
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<string, { answer: string; is_correct: boolean | null; points_earned: number }>
  >({});
  const [rankings, setRankings] = useState<MemberRankingWithChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("no_quiz");
  const [countdown, setCountdown] = useState("");
  const [releaseTime, setReleaseTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [questionCountdowns, setQuestionCountdowns] = useState<Record<string, string>>({});

  const selectedDay = tripDates[activeDay];
  const supabase = getSupabase();

  // Fetch questions and determine status
  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("day_id", selectedDay.id)
          .order("created_at");

        if (!data || data.length === 0) {
          setQuestions([]);
          setQuizStatus("no_quiz");
          setIsLoading(false);
          return;
        }

        const typedData = data as QuizQuestion[];
        setQuestions(typedData);

        // Determine overall quiz status based on any question's timing
        const now = new Date();
        let hasActiveQuestion = false;
        let hasUpcomingQuestion = false;
        let allEnded = true;

        typedData.forEach((q) => {
          const release = q.release_time ? new Date(q.release_time) : null;
          const end = q.end_time ? new Date(q.end_time) : null;

          if (!release || !end) {
            hasActiveQuestion = true;
            allEnded = false;
          } else if (now < release) {
            hasUpcomingQuestion = true;
            allEnded = false;
          } else if (now >= release && now < end) {
            hasActiveQuestion = true;
            allEnded = false;
          }
        });

        // Set overall status
        if (hasActiveQuestion) {
          setQuizStatus("active");
        } else if (hasUpcomingQuestion) {
          setQuizStatus("before_release");
        } else if (allEnded) {
          setQuizStatus("ended");
        } else {
          setQuizStatus("active");
        }

        // For backward compatibility, set releaseTime/endTime from first question
        const firstRelease = typedData[0]?.release_time ? new Date(typedData[0].release_time) : null;
        const firstEnd = typedData[0]?.end_time ? new Date(typedData[0].end_time) : null;
        setReleaseTime(firstRelease);
        setEndTime(firstEnd);
      } catch {
        setQuestions([]);
        setQuizStatus("no_quiz");
      }
      setIsLoading(false);
    }

    fetchQuestions();
  }, [selectedDay.id]);

  // Countdown timer for before_release status
  useEffect(() => {
    if (quizStatus !== "before_release" || !releaseTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = releaseTime.getTime() - now.getTime();

      if (diff <= 0) {
        setQuizStatus("active");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStatus, releaseTime]);

  // Auto-transition from active to ended
  useEffect(() => {
    if (quizStatus !== "active" || !endTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= endTime) {
        setQuizStatus("ended");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStatus, endTime]);

  // Per-question countdown timers
  useEffect(() => {
    if (questions.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newCountdowns: Record<string, string> = {};

      questions.forEach((question) => {
        const qEndTime = question.end_time ? new Date(question.end_time) : null;
        if (qEndTime && now < qEndTime) {
          const diff = qEndTime.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (hours > 0) {
            newCountdowns[question.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            newCountdowns[question.id] = `${minutes}m ${seconds}s`;
          }
        }
      });

      setQuestionCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [questions]);

  // Fetch user's submitted answers
  useEffect(() => {
    async function fetchUserAnswers() {
      if (!member) return;

      try {
        const { data } = await supabase
          .from("quiz_answers")
          .select("question_id, answer, is_correct, points_earned")
          .eq("member_id", member.id);

        const answersMap: Record<
          string,
          { answer: string; is_correct: boolean | null; points_earned: number }
        > = {};
        data?.forEach((a) => {
          answersMap[a.question_id] = {
            answer: a.answer,
            is_correct: a.is_correct,
            points_earned: a.points_earned,
          };
        });
        setSubmittedAnswers(answersMap);
      } catch {
        // Supabase not configured
      }
    }

    fetchUserAnswers();
  }, [member, quizStatus]); // Refetch when status changes (to update after grading)

  // Fetch rankings with position changes
  useEffect(() => {
    async function fetchRankings() {
      try {
        const { data } = await supabase
          .from("member_rankings_with_change")
          .select("*")
          .order("current_rank");

        setRankings((data as MemberRankingWithChange[]) || []);
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
          [questionId]: { answer: answers[questionId], is_correct: null, points_earned: 0 },
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
    quizStatus === "active"
      ? "Open"
      : quizStatus === "ended"
        ? "Closed"
        : quizStatus === "before_release"
          ? "Locked"
          : "No Quiz";

  const statusClass =
    quizStatus === "active"
      ? "bg-[#436c34]/20 text-[#436c34]"
      : quizStatus === "ended"
        ? "bg-gray-200 text-gray-600"
        : quizStatus === "before_release"
          ? "bg-[#ff8522]/20 text-[#ff8522]"
          : "bg-gray-200 text-gray-600";

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
            {member?.is_dev && (
              <button
                onClick={() => router.push("/admin")}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
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
              {tripDates.map((day, index) => (
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

              {/* Countdown Timer */}
              {quizStatus === "before_release" && countdown && (
                <div className="mt-3 flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Releases in: {countdown}</span>
                </div>
              )}
            </div>

            {submitMessage && (
              <div className="mb-4 p-3 bg-[#436c34]/20 text-[#436c34] rounded-lg text-sm text-center border border-[#436c34]/30">
                {submitMessage}
              </div>
            )}

            {/* Quiz Content */}
            {isLoading ? (
              <div className="text-center py-8 text-white/60">
                Loading questions...
              </div>
            ) : quizStatus === "no_quiz" ? (
              <div className="bg-white/10 rounded-2xl p-6 text-center text-white/60">
                No quiz for {selectedDay.label} yet.
              </div>
            ) : quizStatus === "before_release" ? (
              <div className="bg-white/10 rounded-2xl p-6 text-center text-white/60">
                <p className="mb-2">Quiz is locked</p>
                <p className="text-sm">Check back when the countdown ends!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const submitted = submittedAnswers[question.id];
                  const isAnswered = !!submitted;

                  // Determine per-question status
                  const now = new Date();
                  const qRelease = question.release_time ? new Date(question.release_time) : null;
                  const qEnd = question.end_time ? new Date(question.end_time) : null;

                  let questionStatus: "locked" | "active" | "ended" = "active";
                  if (qRelease && qEnd) {
                    if (now < qRelease) {
                      questionStatus = "locked";
                    } else if (now >= qEnd) {
                      questionStatus = "ended";
                    }
                  }

                  const showResults = questionStatus === "ended" || quizStatus === "ended";
                  const canAnswer = questionStatus === "active" && !isAnswered;

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
                          {questionStatus === "locked" && (
                            <span className="rounded-full bg-[#ff8522]/20 text-[#ff8522] px-2 py-0.5 text-xs font-medium">
                              🔒 Locked
                            </span>
                          )}
                          {questionStatus === "ended" && (
                            <span className="rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-xs font-medium">
                              Closed
                            </span>
                          )}
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

                      {/* Question countdown timer */}
                      {questionCountdowns[question.id] && (
                        <div className="mt-2 flex items-center gap-2 text-[#ff8522] text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Time left: {questionCountdowns[question.id]}</span>
                        </div>
                      )}

                      {/* Show user's answer if answered */}
                      {isAnswered && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Your answer:{" "}
                            <span className="font-medium">
                              {submitted.answer}
                            </span>
                          </p>
                          {submitted.is_correct !== null && (
                            <div className="flex items-center justify-between mt-2">
                              <p
                                className={`text-sm font-medium ${submitted.is_correct ? "text-[#436c34]" : "text-[#fa655f]"}`}
                              >
                                {submitted.is_correct
                                  ? "✓ Correct!"
                                  : "✗ Incorrect"}
                              </p>
                              <p className="text-sm font-bold text-[#ff8522]">
                                +{submitted.points_earned} pt
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show correct answer after quiz ends */}
                      {showResults && question.correct_answer && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            Correct answer:{" "}
                            <span className="font-semibold">
                              {question.correct_answer}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Locked message */}
                      {questionStatus === "locked" && (
                        <div className="mt-3 p-3 bg-[#ff8522]/10 rounded-lg text-sm text-gray-600 text-center">
                          This question will be available soon...
                        </div>
                      )}

                      {/* Input fields (only if active and not answered) */}
                      {canAnswer && (
                        <>
                          {question.type === "mc" && question.options ? (
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
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Rankings Tab
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
                      {player.current_rank}
                    </div>
                    {/* Avatar */}
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

                  <div className="flex items-center gap-3">
                    {/* Position change arrow */}
                    {player.rank_change !== 0 && player.previous_rank !== null && (
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold ${
                          player.rank_change > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {player.rank_change > 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(player.rank_change)}</span>
                      </div>
                    )}

                    {/* Points */}
                    <span className="text-lg font-bold text-[#ff8522]">
                      {player.total_points} pts
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
