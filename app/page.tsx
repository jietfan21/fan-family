"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmojiPicker from "@/components/EmojiPicker";
import WinnerCelebration from "@/components/WinnerCelebration";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

interface Photo {
  id: string;
  name: string;
  emoji: string | null;
  day6_photo_url: string;
  day6_photo_uploaded_at: string;
}

interface Winner {
  id: string;
  name: string;
  emoji: string | null;
  total_points: number;
  correct_answers: number;
  total_answers: number;
  accuracy_percentage: number;
  rank: number;
}

function HomeContent() {
  const { member, logout, updateEmoji, isFirstLogin, setFirstLoginComplete } =
    useAuth();
  const router = useRouter();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [day6Photos, setDay6Photos] = useState<Photo[]>([]);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);

  const showPicker = isFirstLogin || showEmojiPicker;
  const supabase = getSupabase();

  // Helper function to shuffle array
  const shuffleArray = (length: number): number[] => {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Fetch quiz winners and show celebration popup (once per session)
  useEffect(() => {
    async function fetchWinners() {
      // Check if we've already shown the popup this session
      const hasShownPopup = sessionStorage.getItem("winnerPopupShown");
      if (hasShownPopup === "true") {
        return;
      }

      try {
        const response = await fetch("/api/quiz/winners");
        const data = await response.json();

        if (data.winners && data.winners.length > 0) {
          setWinners(data.winners);
          setShowWinnerCelebration(true);
          // Mark as shown for this session
          sessionStorage.setItem("winnerPopupShown", "true");
        }
      } catch (error) {
        console.error("Failed to fetch winners:", error);
      }
    }

    fetchWinners();
  }, []);

  // Fetch Day 6 photos
  useEffect(() => {
    async function fetchDay6Photos() {
      try {
        const { data } = await supabase
          .from("members")
          .select("id, name, emoji, day6_photo_url, day6_photo_uploaded_at")
          .not("day6_photo_url", "is", null)
          .order("day6_photo_uploaded_at", { ascending: true });

        const photos = (data as Photo[]) || [];
        setDay6Photos(photos);

        // Initialize with shuffled indices and start at random position
        if (photos.length > 0) {
          const shuffled = shuffleArray(photos.length);
          setShuffledIndices(shuffled);
          setCurrentShuffleIndex(0);
        }
      } catch {
        setDay6Photos([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    }

    fetchDay6Photos();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDay6Photos, 30000);
    return () => clearInterval(interval);
  }, [supabase]);

  // Auto-rotate photos through shuffled indices
  useEffect(() => {
    if (day6Photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentShuffleIndex((prev) => {
        const next = prev + 1;
        // If we've shown all photos, reshuffle
        if (next >= shuffledIndices.length) {
          setShuffledIndices(shuffleArray(day6Photos.length));
          return 0;
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [day6Photos.length, shuffledIndices.length]);

  // Get current photo based on shuffled index
  const currentPhotoIndex = shuffledIndices[currentShuffleIndex] || 0;

  // Fetch unanswered question count
  useEffect(() => {
    async function fetchUnansweredCount() {
      if (!member) return;

      try {
        // Get all active questions (questions that are currently available to answer)
        const now = new Date().toISOString();
        const { data: questions } = await supabase
          .from("quiz_questions")
          .select("id, release_time, end_time")
          .lte("release_time", now)
          .gte("end_time", now);

        if (!questions || questions.length === 0) {
          setUnansweredCount(0);
          return;
        }

        // Get user's answered questions
        const { data: answers } = await supabase
          .from("quiz_answers")
          .select("question_id")
          .eq("member_id", member.id);

        const answeredIds = new Set(answers?.map((a) => a.question_id) || []);
        const unanswered = questions.filter((q) => !answeredIds.has(q.id));

        setUnansweredCount(unanswered.length);
      } catch {
        setUnansweredCount(0);
      }
    }

    fetchUnansweredCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnansweredCount, 30000);
    return () => clearInterval(interval);
  }, [member, supabase]);

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
      {/* Winner Celebration Popup */}
      <WinnerCelebration
        isOpen={showWinnerCelebration}
        onClose={() => setShowWinnerCelebration(false)}
        winners={winners}
      />

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

          {/* Title */}
          <div className="mb-4">
            {/* Title Text */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-white mb-1">
                🌴 Bali Trip 2025 🌺
              </h1>
            </div>

            {/* Day 6 Photo Carousel */}
            <div
              className="relative cursor-pointer group"
              onClick={() => day6Photos.length > 0 && setShowPhotoPreview(true)}
            >
              {isLoadingPhotos ? (
                /* Loading skeleton */
                <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg ring-4 ring-white/20 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60"></div>
                  </div>
                </div>
              ) : day6Photos.length > 0 ? (
                <>
                  <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg ring-4 ring-white/20 bg-black">
                    <Image
                      src={day6Photos[currentPhotoIndex].day6_photo_url}
                      alt={`Photo by ${day6Photos[currentPhotoIndex].name}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 448px"
                    />

                    {/* Uploader Info Overlay */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-white">
                        {day6Photos[currentPhotoIndex].emoji && (
                          <span className="mr-1">{day6Photos[currentPhotoIndex].emoji}</span>
                        )}
                        {day6Photos[currentPhotoIndex].name}
                      </p>
                    </div>

                    {/* Click hint */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white">Tap to view all</p>
                    </div>

                    {/* Photo count indicator */}
                    {day6Photos.length > 1 && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                        <p className="text-xs text-white">
                          {currentPhotoIndex + 1}/{day6Photos.length}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm text-white/80 mt-2">
                    🌴 Everyone's Favorite Moments / 大家最喜欢的瞬间
                  </p>
                </>
              ) : (
                <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg ring-4 ring-white/20 bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center px-6">
                    <p className="text-2xl mb-2">📸</p>
                    <p className="text-white font-medium mb-1">No Day 6 photos yet</p>
                    <p className="text-white/70 text-sm mb-1">Be the first to share!</p>
                    <p className="text-white font-medium mb-1">还没有 Day 6 照片</p>
                    <p className="text-white/70 text-sm">快来第一个分享吧！</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Dialog */}
      {showPhotoPreview && day6Photos.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                🌴 Everyone's Favorite Moments
              </h3>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                大家最喜欢的瞬间
              </h3>

              {/* Current Photo Display */}
              <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden shadow-lg mb-4">
                <Image
                  src={day6Photos[currentPhotoIndex].day6_photo_url}
                  alt={`Photo by ${day6Photos[currentPhotoIndex].name}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 448px"
                />

                {/* Uploader Info */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-white">
                    {day6Photos[currentPhotoIndex].emoji && (
                      <span className="mr-1">{day6Photos[currentPhotoIndex].emoji}</span>
                    )}
                    {day6Photos[currentPhotoIndex].name}
                  </p>
                  <p className="text-xs text-white/80">
                    {new Date(day6Photos[currentPhotoIndex].day6_photo_uploaded_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

                {/* Navigation Arrows */}
                {day6Photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentShuffleIndex((prev: number) => (prev - 1 + shuffledIndices.length) % shuffledIndices.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentShuffleIndex((prev: number) => (prev + 1) % shuffledIndices.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {day6Photos.length > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                  {shuffledIndices.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => setCurrentShuffleIndex(dotIndex)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        dotIndex === currentShuffleIndex
                          ? "bg-blue-600 w-6"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowPhotoPreview(false);
                    router.push("/quiz?day=day6");
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Upload / 前往上传
                </button>
                <button
                  onClick={() => setShowPhotoPreview(false)}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close / 关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pb-8 -mt-4">
        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <div className="relative">
                {/* Notification Badge for Quiz */}
                {feature.href === "/quiz" && unansweredCount > 0 && (
                  <div className="absolute -top-2 -right-2 z-10 bg-red-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg ring-2 ring-white">
                    {unansweredCount}
                  </div>
                )}
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
