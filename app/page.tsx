"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmojiPicker from "@/components/EmojiPicker";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const { member, logout, updateEmoji, isFirstLogin, setFirstLoginComplete } =
    useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const showPicker = isFirstLogin || showEmojiPicker;

  const handleEmojiSelect = async (emoji: string) => {
    setIsUpdating(true);
    await updateEmoji(emoji);
    setIsUpdating(false);
    setShowEmojiPicker(false);
    if (isFirstLogin) {
      setFirstLoginComplete();
    }
  };

  const handleClosePicker = () => {
    setShowEmojiPicker(false);
    if (isFirstLogin) {
      setFirstLoginComplete();
    }
  };

  const features = [
    {
      href: "/schedule",
      icon: "📅",
      title: "Schedule",
      subtitle: "Trip itinerary",
      bg: "bg-[#00b4fb]",
    },
    {
      href: "/currency",
      icon: "💱",
      title: "Currency",
      subtitle: "IDR converter",
      bg: "bg-[#9b59b6]",
    },
    {
      href: "/quiz",
      icon: "🧠",
      title: "我猜我猜",
      subtitle: "Guess & Win",
      bg: "bg-[#fa655f]",
    },
    {
      href: "/arrangement",
      icon: "🚐",
      title: "Arrangement",
      subtitle: "Cars & rooms",
      bg: "bg-[#ff8522]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42]">
      {/* Emoji Picker Modal */}
      <EmojiPicker
        isOpen={showPicker}
        onClose={handleClosePicker}
        onSelect={handleEmojiSelect}
        currentEmoji={member?.emoji || undefined}
      />

      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 text-6xl">🌴</div>
          <div className="absolute top-8 right-8 text-5xl">🌺</div>
          <div className="absolute bottom-0 left-1/3 text-4xl">🌊</div>
        </div>

        <div className="relative max-w-md mx-auto p-6 pt-8">
          {/* User Profile */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEmojiPicker(true)}
                disabled={isUpdating}
                className="w-14 h-14 rounded-full bg-[#00b4fb] flex items-center justify-center text-2xl shadow-lg hover:bg-[#4dc9ff] transition-all active:scale-95 ring-2 ring-white/30"
              >
                {member?.emoji || (
                  <span className="text-white font-bold text-xl">
                    {member?.name.charAt(0)}
                  </span>
                )}
              </button>
              <div>
                <p className="font-bold text-lg text-white">{member?.name}</p>
                <p className="text-sm text-[#00b4fb]">
                  {member?.is_dev ? "Developer" : "Family Member"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-white/10"
            >
              Logout
            </button>
          </div>

          {/* Title with Family Photo */}
          <div className="mb-4">
            {/* Title Text */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-white mb-1">
                🌴 Bali Trip 2025 🌺
              </h1>
            </div>

            {/* Family Photo */}
            <div>
              <img
                src="/family.jpeg"
                alt="Family"
                className="w-full h-48 rounded-xl object-cover shadow-lg ring-4 ring-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pb-8 -mt-4">
        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <div
                className={`${feature.bg} rounded-3xl p-5 h-40 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all active:scale-95 hover:-translate-y-1`}
              >
                <div className="text-4xl">{feature.icon}</div>
                <div className="text-white">
                  <h2 className="text-lg font-bold leading-tight">
                    {feature.title}
                  </h2>
                  <p className="text-sm text-white/80">{feature.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Christmas Party Card */}
        <Link href="/lucky-draw">
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all active:scale-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎁</div>
                <div>
                  <p className="font-semibold text-white">Christmas Party</p>
                  <p className="text-sm text-white/60">Gift exchange & lucky draw</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl">🎄</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Tip Card */}
        <div className="mt-4 bg-[#ff8522]/20 rounded-2xl p-4 border border-[#ff8522]/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-[#ff8522]">Tip of the day</p>
              <p className="text-sm text-white/70 mt-1">
                Tap your profile picture to change your avatar anytime!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
