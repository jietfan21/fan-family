"use client";

import Link from "next/link";
import { useState } from "react";

type MainTab = "quiz" | "ranking";
type QuestionType = "mc" | "number";
type QuizStatus = "none" | "active" | "soon";

type QuizQuestion = {
  id: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
};

type QuizDay = {
  id: string;
  label: string;
  date: string;
  status: QuizStatus;
  questions: QuizQuestion[];
};

const quizDays: QuizDay[] = [
  {
    id: "day1",
    label: "Day 1",
    date: "Dec 22",
    status: "none",
    questions: [],
  },
  {
    id: "day2",
    label: "Day 2",
    date: "Dec 23",
    status: "active",
    questions: [
      {
        id: "d2q1",
        prompt:
          "How many people wear black shirt/top/outfit on Day 2? (2-digit)",
        type: "number",
      },
      {
        id: "d2q2",
        prompt: "Which driver is the oldest?",
        type: "mc",
        options: [
          "A) Mr Wayan (Car A)",
          "B) Mr Nengah (Car B)",
          "C) Mr Ocha (Car C)",
        ],
      },
      {
        id: "d2q3",
        prompt: "Which car arrives at ATV first in Day 2?",
        type: "mc",
        options: [
          "A) Mr Wayan (Car A)",
          "B) Mr Nengah (Car B)",
          "C) Mr Ocha (Car C)",
        ],
      },
    ],
  },
  {
    id: "day3",
    label: "Day 3",
    date: "Dec 24",
    status: "soon",
    questions: [],
  },
  {
    id: "day4",
    label: "Day 4",
    date: "Dec 25",
    status: "soon",
    questions: [],
  },
  {
    id: "day5",
    label: "Day 5",
    date: "Dec 26",
    status: "soon",
    questions: [],
  },
  {
    id: "day6",
    label: "Day 6",
    date: "Dec 27",
    status: "soon",
    questions: [],
  },
];

const rankingList = Array.from({ length: 20 }, (_, index) => ({
  name: `Player ${index + 1}`,
  points: 0,
}));

export default function QuizPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("quiz");
  const activeDayIndex = Math.max(
    quizDays.findIndex((day) => day.status === "active"),
    0
  );
  const [activeDay, setActiveDay] = useState(activeDayIndex);
  const selectedDay = quizDays[activeDay];
  const statusLabel =
    selectedDay.status === "active"
      ? "Open"
      : selectedDay.status === "none"
        ? "Closed"
        : "Coming soon";
  const statusClass =
    selectedDay.status === "active"
      ? "bg-green-100 text-green-700"
      : selectedDay.status === "none"
        ? "bg-gray-200 text-gray-600"
        : "bg-amber-100 text-amber-700";
  const statusMessage =
    selectedDay.status === "active"
      ? `Voting open for ${selectedDay.label}`
      : selectedDay.status === "none"
        ? `No quiz for ${selectedDay.label}`
        : "Quiz will open soon";

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 pb-20">
      <div className="bg-gradient-to-r from-red-500 to-green-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">🧠 我猜我猜我猜猜猜</h1>
            <p className="text-sm opacity-90">Guessing Quiz</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-full p-1 shadow-sm flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "quiz"
                ? "bg-red-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "ranking"
                ? "bg-green-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Ranking
          </button>
        </div>

        {activeTab === "quiz" ? (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
              {quizDays.map((day, index) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(index)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    activeDay === index
                      ? "bg-white text-red-600 shadow-lg"
                      : "bg-white/70 text-gray-700 hover:bg-white"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500">{selectedDay.date}</p>
              <div className="flex items-center justify-between mt-1">
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedDay.label} Quiz
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600">{statusMessage}</p>
            </div>

            {selectedDay.status === "active" ? (
              <div className="space-y-4">
                {selectedDay.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-2xl shadow-md p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Question {index + 1}</span>
                      <span className="rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-xs font-medium">
                        {question.type === "mc"
                          ? "Multiple Choice"
                          : "2-digit answer"}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-gray-800">
                      {question.prompt}
                    </p>

                    {question.type === "mc" && question.options ? (
                      <div className="mt-3 space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <input type="radio" disabled className="h-4 w-4" />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          disabled
                          placeholder="00"
                          className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <span className="text-xs text-gray-500">
                          2-digit answer
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-600">
                {selectedDay.status === "none"
                  ? `No quiz for ${selectedDay.label}.`
                  : "Coming soon."}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rankingList.map((player, index) => (
              <div
                key={player.name}
                className="bg-white rounded-2xl shadow-md p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{player.name}</p>
                    <p className="text-xs text-gray-500">0 points</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {player.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
