"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  name: string;
  emoji: string | null;
  day6_photo_url: string;
  day6_photo_uploaded_at: string;
}

export default function Day6PhotoCarousel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch photos
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/day6-photo/list");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch photos");
      }

      setPhotos(data.photos || []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  // Auto-play carousel
  useEffect(() => {
    if (photos.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [photos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 3000);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-center text-gray-500 mb-1">
          No photos uploaded yet. Be the first to share your favorite Bali
          moment!
        </p>
        <p className="text-center text-gray-500">
          还没有人上传照片。快来第一个分享你最喜欢的巴厘岛瞬间吧！
        </p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium mb-3 text-gray-600 text-center">
        🌴 Everyone&apos;s Favorite Moments / 大家最喜欢的瞬间
      </h3>

      <div className="relative">
        {/* Photo Container */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Photo Display with 3:4 aspect ratio */}
          <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden shadow-lg">
            <Image
              src={currentPhoto.day6_photo_url}
              alt={`Photo by ${currentPhoto.name}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 448px"
              priority
            />

            {/* Uploader Info Overlay */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-white">
                {currentPhoto.emoji && <span className="mr-1">{currentPhoto.emoji}</span>}
                {currentPhoto.name}
              </p>
              <p className="text-xs text-white/80">
                {new Date(currentPhoto.day6_photo_uploaded_at).toLocaleDateString(
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
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                aria-label="Previous photo"
              >
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                aria-label="Next photo"
              >
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-blue-600 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <p className="text-center text-xs text-gray-500 mt-2">
            {currentIndex + 1} / {photos.length}
          </p>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button
          onClick={fetchPhotos}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Refresh to see new photos / 刷新查看新照片
        </button>
      </div>
    </div>
  );
}
