"use client";

import { useEffect, useState } from "react";

interface Winner {
  id: string;
  name: string;
  emoji: string | null;
  total_points: number;
  correct_answers: number;
  total_answers: number;
  accuracy_percentage: number;
  rank: number; // 1, 2, or 3
}

interface WinnerCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  winners: Winner[];
}

export default function WinnerCelebration({
  isOpen,
  onClose,
  winners,
}: WinnerCelebrationProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowFireworks(true);
      // Stop fireworks after 5 seconds
      const timer = setTimeout(() => setShowFireworks(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Fireworks Container */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="firework"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#FFD700",
                  "#FF6B9D",
                  "#4ECDC4",
                  "#95E1D3",
                  "#FF8A80",
                  "#82B1FF",
                ][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-scaleIn">
        {/* Close X Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Sparkle Header */}
        <div className="relative bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 p-4 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              >
                ✨
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-1 animate-bounce">
              🎉 CONGRATULATIONS! 🎉
            </h2>
            <p className="text-white text-sm font-medium">恭喜恭喜！</p>
          </div>
        </div>

        {/* Winners Section */}
        <div className="p-4 space-y-3">
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold text-gray-800 mb-0.5">
              Top Quiz Champions!
            </h3>
            <p className="text-sm text-gray-600">
              🏆 Highest Scorers 🏆
            </p>
            <p className="text-xs text-gray-500">积分排行榜前三名！</p>
          </div>

          {/* Winner Rows - Grouped by Rank */}
          <div className="space-y-2.5">
            {[1, 2, 3].map((rank) => {
              const rankWinners = winners.filter((w) => w.rank === rank);
              if (rankWinners.length === 0) return null;

              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
              const bgGradient =
                rank === 1
                  ? "from-yellow-50 via-amber-50 to-yellow-50 border-yellow-400"
                  : rank === 2
                    ? "from-gray-50 via-slate-100 to-gray-50 border-gray-400"
                    : "from-orange-50 via-amber-50 to-orange-50 border-orange-400";

              const points = rankWinners[0].total_points;
              const correctAnswers = rankWinners[0].correct_answers;
              const totalAnswers = rankWinners[0].total_answers;

              return (
                <div
                  key={rank}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${bgGradient} p-3 border-2 shadow-lg`}
                >
                  {/* Medal Badge Watermark */}
                  <div className="absolute -right-1 -top-1 text-4xl opacity-10 rotate-12">
                    {medal}
                  </div>

                  <div className="relative">
                    {/* Rank Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-3xl">{medal}</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">
                          {rank === 1 ? "1st Place" : rank === 2 ? "2nd Place" : "3rd Place"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {points} pts | {correctAnswers}/{totalAnswers} correct
                        </p>
                      </div>
                    </div>

                    {/* All Winners in This Rank */}
                    <div className="flex flex-wrap gap-1.5">
                      {rankWinners.map((winner) => (
                        <div
                          key={winner.id}
                          className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm"
                        >
                          <div className="text-base">
                            {winner.emoji || (
                              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">
                                {winner.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">
                            {winner.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg text-sm"
          >
            Close / 关闭
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fireworkExplode {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .firework {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            #fff 0%,
            #ffd700 20%,
            #ff6b9d 40%,
            #4ecdc4 60%,
            transparent 100%
          );
          animation: fireworkExplode 1.5s ease-out infinite;
          box-shadow:
            0 0 10px #ffd700,
            0 0 20px #ff6b9d,
            0 0 30px #4ecdc4;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall linear forwards;
        }

        .sparkle {
          position: absolute;
          font-size: 1.5rem;
          animation: sparkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
