"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Winner {
  number: number;
  name: string;
  timestamp: number;
}

// Shuffle function to randomize numbers
const shuffleArray = (array: number[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function LuckyDraw() {
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [rotation, setRotation] = useState(0);

  // Initialize from localStorage
  useEffect(() => {
    const storedWinners = localStorage.getItem("luckyDrawWinners");
    if (storedWinners) {
      const parsedWinners: Winner[] = JSON.parse(storedWinners);
      setWinners(parsedWinners);
      const usedNumbers = parsedWinners.map((w) => w.number);
      const remaining = Array.from({ length: 25 }, (_, i) => i + 1).filter(
        (n) => !usedNumbers.includes(n)
      );
      setAvailableNumbers(shuffleArray(remaining));
    } else {
      setAvailableNumbers(shuffleArray(Array.from({ length: 25 }, (_, i) => i + 1)));
    }
  }, []);

  const handleSpin = () => {
    if (spinning || availableNumbers.length === 0) return;

    setSpinning(true);

    // Random spins (5-10 full rotations + random position)
    const spins = 5 + Math.floor(Math.random() * 5);
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const degreesPerSegment = 360 / availableNumbers.length;
    const targetRotation = spins * 360 + randomIndex * degreesPerSegment;

    setRotation(targetRotation);

    // After animation completes
    setTimeout(() => {
      setSpinning(false);
      setSelectedNumber(availableNumbers[randomIndex]);
      setShowModal(true);
    }, 3000);
  };

  const handleAssign = () => {
    if (!selectedNumber || !nameInput.trim()) return;

    const newWinner: Winner = {
      number: selectedNumber,
      name: nameInput.trim(),
      timestamp: Date.now(),
    };

    const updatedWinners = [...winners, newWinner];
    setWinners(updatedWinners);
    localStorage.setItem("luckyDrawWinners", JSON.stringify(updatedWinners));

    // Remove number from available
    const updatedNumbers = availableNumbers.filter((n) => n !== selectedNumber);
    setAvailableNumbers(shuffleArray(updatedNumbers));

    // Reset
    setShowModal(false);
    setNameInput("");
    setSelectedNumber(null);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all winners?")) {
      localStorage.removeItem("luckyDrawWinners");
      setWinners([]);
      setAvailableNumbers(shuffleArray(Array.from({ length: 25 }, (_, i) => i + 1)));
      setSelectedNumber(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-green-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">🎁 Christmas Lucky Draw</h1>
            <p className="text-sm opacity-90">
              {availableNumbers.length} numbers left
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Wheel Container */}
        <div className="mb-8">
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-lg"></div>
            </div>

            {/* Wheel */}
            <div className="relative w-full h-full">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                }}
              >
                {availableNumbers.map((number, index) => {
                  const angle = (360 / availableNumbers.length) * index;
                  const nextAngle = (360 / availableNumbers.length) * (index + 1);
                  const startAngle = (angle - 90) * (Math.PI / 180);
                  const endAngle = (nextAngle - 90) * (Math.PI / 180);

                  const x1 = 100 + 90 * Math.cos(startAngle);
                  const y1 = 100 + 90 * Math.sin(startAngle);
                  const x2 = 100 + 90 * Math.cos(endAngle);
                  const y2 = 100 + 90 * Math.sin(endAngle);

                  const largeArc = nextAngle - angle > 180 ? 1 : 0;

                  const path = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  // Alternate colors
                  const colors = ["#ef4444", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];
                  const color = colors[index % colors.length];

                  // Text position
                  const textAngle = angle + (nextAngle - angle) / 2;
                  const textRad = (textAngle - 90) * (Math.PI / 180);
                  const textX = 100 + 60 * Math.cos(textRad);
                  const textY = 100 + 60 * Math.sin(textRad);

                  return (
                    <g key={number}>
                      <path d={path} fill={color} stroke="white" strokeWidth="1" />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      >
                        {number}
                      </text>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="15" fill="white" stroke="#333" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleSpin}
              disabled={spinning || availableNumbers.length === 0}
              className={`px-8 py-4 rounded-full text-xl font-bold text-white shadow-lg transition-all ${
                spinning || availableNumbers.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-green-500 hover:shadow-xl active:scale-95"
              }`}
            >
              {spinning ? "Spinning... 🎰" : availableNumbers.length === 0 ? "All Done! 🎉" : "SPIN THE WHEEL 🎡"}
            </button>
          </div>
        </div>

        {/* Winners List */}
        {winners.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-800">🏆 Winners</h2>
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Reset All
              </button>
            </div>
            <div className="space-y-2">
              {[...winners].reverse().map((winner, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-green-500 flex items-center justify-center text-white font-bold">
                      {winner.number}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{winner.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(winner.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl">🎁</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Tap "SPIN THE WHEEL" to start</li>
            <li>2. Wheel will land on a random number</li>
            <li>3. Enter the person's name</li>
            <li>4. That number is assigned and removed from wheel</li>
            <li>5. Continue until all 25 numbers are assigned!</li>
          </ul>
        </div>
      </div>

      {/* Assignment Modal */}
      {showModal && selectedNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Number {selectedNumber}!
              </h2>
              <p className="text-gray-600">Who gets this gift?</p>
            </div>

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-red-500"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleAssign()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedNumber(null);
                  setNameInput("");
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!nameInput.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                  nameInput.trim()
                    ? "bg-gradient-to-r from-red-500 to-green-500 text-white hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
