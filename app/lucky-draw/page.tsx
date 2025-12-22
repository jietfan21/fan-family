"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const diceRules = [
  {
    number: 1,
    destinyEn: "Stay Put",
    destinyZh: "安全留守",
    actionEn: "KEEP your gift! No swapping.",
    actionZh: "保留禮物！禮物不換。",
    color: "bg-[#436c34]",
  },
  {
    number: 2,
    destinyEn: "Pass Right!",
    destinyZh: "向右傳！",
    actionEn: "Swap gifts with the person on your RIGHT.",
    actionZh: "與右邊的人交換禮物。",
    color: "bg-[#00b4fb]",
  },
  {
    number: 3,
    destinyEn: "Pass Left!",
    destinyZh: "向左傳！",
    actionEn: "Swap gifts with the person on your LEFT.",
    actionZh: "與左邊的人交換禮物。",
    color: "bg-[#00b4fb]",
  },
  {
    number: 4,
    destinyEn: "All Move",
    destinyZh: "全體傳",
    actionEn: "ALL gifts pass one position clockwise.",
    actionZh: "所有禮物順時針傳一位。",
    color: "bg-[#ff8522]",
  },
  {
    number: 5,
    destinyEn: "You Choose",
    destinyZh: "你選",
    actionEn: "Swap gifts with ANY person you choose.",
    actionZh: "與任一位你指定的人交換禮物。",
    color: "bg-[#9333ea]",
  },
  {
    number: 6,
    destinyEn: "BONUS CASH!",
    destinyZh: "紅包加碼！",
    actionEn: "Draw one ANGPAO from the center!",
    actionZh: "從中間紅包堆裡抽取一個紅包！",
    color: "bg-[#fa655f]",
  },
];

const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

type MainTab = "rules" | "play";

export default function LuckyDrawPage() {
  return (
    <ProtectedRoute>
      <LuckyDrawContent />
    </ProtectedRoute>
  );
}

function LuckyDrawContent() {
  const { member } = useAuth();
  const [activeTab, setActiveTab] = useState<MainTab>("rules");
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setDiceResult(null);

    // Animate through random numbers
    let count = 0;
    const interval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalResult);
        setIsRolling(false);
      }
    }, 100);
  };

  const currentRule = diceResult ? diceRules[diceResult - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#fa655f] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">🎄 Christmas Party</h1>
            <p className="text-sm opacity-90">Gift Exchange Game</p>
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
            onClick={() => setActiveTab("rules")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "rules"
                ? "bg-[#fa655f] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab("play")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "play"
                ? "bg-[#436c34] text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Roll Dice
          </button>
        </div>

        {activeTab === "rules" ? (
          <div>
            {/* Game Setup Info */}
            <div className="mb-4 bg-white/10 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-white mb-2">
                🎁 How to Play
              </h2>
              <div className="text-sm text-white/80 space-y-2">
                <p>
                  <span className="text-[#00b4fb] font-medium">Ready:</span>{" "}
                  Everyone sits in a circle, choose and hold their wrapped gift
                </p>
                <p>
                  <span className="text-[#ff8522] font-medium">Game Flow:</span>{" "}
                  Roll the Dice & Follow the Command
                </p>
              </div>
            </div>

            {/* Dice Rules */}
            <div className="space-y-3">
              {diceRules.map((rule) => (
                <div
                  key={rule.number}
                  className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Dice Icon */}
                    <div
                      className={`w-14 h-14 ${rule.color} rounded-xl flex items-center justify-center text-3xl text-white shadow-md`}
                    >
                      {diceFaces[rule.number]}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#011a42]">
                          {rule.destinyEn}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {rule.destinyZh}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{rule.actionEn}</p>
                      <p className="text-sm text-gray-500">{rule.actionZh}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* End Game Info */}
            <div className="mt-6 bg-[#436c34]/20 border border-[#436c34]/30 rounded-xl p-4">
              <h3 className="font-semibold text-[#436c34] mb-2">🎉 Game End</h3>
              <p className="text-sm text-white/80">
                The game ends after 1 round. The gift you are holding is yours
                to keep! OPEN IT!
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Dice Roller */}
            <div className="bg-white/10 rounded-2xl p-6 text-center mb-4">
              <h2 className="text-lg font-bold text-white mb-4">
                🎲 Roll Your Destiny!
              </h2>

              {/* Dice Display */}
              <div
                className={`w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-7xl mb-6 transition-all ${
                  isRolling
                    ? "bg-white/20 animate-bounce"
                    : diceResult
                      ? diceRules[diceResult - 1].color
                      : "bg-white/10"
                } ${diceResult ? "text-white shadow-lg" : "text-white/50"}`}
              >
                {diceResult ? diceFaces[diceResult] : "?"}
              </div>

              {/* Roll Button */}
              <button
                onClick={rollDice}
                disabled={isRolling}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isRolling
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#fa655f] hover:bg-[#e5524e] shadow-lg hover:shadow-xl"
                } text-white`}
              >
                {isRolling ? "Rolling..." : "🎲 ROLL THE DICE!"}
              </button>
            </div>

            {/* Result Display */}
            {currentRule && !isRolling && (
              <div
                className={`${currentRule.color} rounded-2xl p-6 text-white shadow-lg animate-in fade-in duration-300`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-3">{diceFaces[diceResult!]}</div>
                  <h3 className="text-2xl font-bold mb-1">
                    {currentRule.destinyEn}
                  </h3>
                  <p className="text-lg opacity-90 mb-3">
                    {currentRule.destinyZh}
                  </p>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="font-medium">{currentRule.actionEn}</p>
                    <p className="text-sm opacity-90 mt-1">
                      {currentRule.actionZh}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reference */}
            <div className="mt-6 bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white/80 mb-3 text-sm">
                Quick Reference
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {diceRules.map((rule) => (
                  <div
                    key={rule.number}
                    className={`${rule.color} rounded-lg p-2 text-center text-white`}
                  >
                    <div className="text-xl">{diceFaces[rule.number]}</div>
                    <div className="text-xs font-medium truncate">
                      {rule.destinyEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
