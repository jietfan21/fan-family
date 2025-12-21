"use client";

import Link from "next/link";

const diceRules = [
  {
    number: 1,
    destinyEn: "Stay Put",
    destinyZh: "安全留守",
    actionEn: "KEEP your gift! No swapping.",
    actionZh: "保留禮物！禮物不換。",
  },
  {
    number: 2,
    destinyEn: "Pass Right!",
    destinyZh: "向右傳！",
    actionEn: "Swap gifts with the person on your RIGHT.",
    actionZh: "與右邊的人交換禮物。",
  },
  {
    number: 3,
    destinyEn: "Pass Left!",
    destinyZh: "向左傳！",
    actionEn: "Swap gifts with the person on your LEFT.",
    actionZh: "與左邊的人交換禮物。",
  },
  {
    number: 4,
    destinyEn: "All Move",
    destinyZh: "全體傳",
    actionEn: "ALL gifts pass one position clockwise.",
    actionZh: "所有禮物順時針傳一位。",
  },
  {
    number: 5,
    destinyEn: "You Choose",
    destinyZh: "你選",
    actionEn: "Swap gifts with ANY person you choose.",
    actionZh: "與任一位你指定的人交換禮物。",
  },
  {
    number: 6,
    destinyEn: "BONUS CASH!",
    destinyZh: "紅包加碼！",
    actionEn: "Draw one ANGPAO from the center!",
    actionZh: "從中間紅包堆裡抽取一個紅包！",
  },
];

const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function LuckyDraw() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-green-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">🎄 Christmas Party</h1>
            <p className="text-sm opacity-90">Gift Exchange Game Rules</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Christmas Party Rules */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎄 Christmas Party</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <span className="font-medium">Ready:</span> Everyone sits in a
              circle, choose and hold their wrapped gift
            </p>
            <p>
              <span className="font-medium">Game Flow:</span> Roll the Dice &
              Follow the Command
            </p>
          </div>

          <div className="mt-2 space-y-3">
            {diceRules.map((rule) => (
              <div
                key={rule.number}
                className="bg-white border border-blue-100 rounded-xl p-3 flex gap-3 items-start"
              >
                <div className="text-4xl leading-none text-blue-700">
                  {diceFaces[rule.number]}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-blue-900">
                    {rule.destinyEn}{" "}
                    <span className="text-blue-700 font-normal">
                      {rule.destinyZh}
                    </span>
                  </p>
                  <p className="text-sm text-blue-800">{rule.actionEn}</p>
                  <p className="text-sm text-blue-700">{rule.actionZh}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white border border-blue-100 rounded-xl p-3 text-blue-900 text-sm font-medium">
            The game ends after 1 round. The gift you are holding is yours to
            keep! OPEN IT!
          </div>
        </div>
      </div>

    </div>
  );
}
