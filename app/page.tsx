import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-green-50 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            🎄 Bali Family Trip
          </h1>
          <p className="text-lg text-gray-600">December 22-27, 2025</p>
          <p className="text-sm text-gray-500 mt-1">25 Family Members</p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          {/* Schedule Feature */}
          <Link href="/schedule">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow active:scale-95 transition-transform">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📅</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
                  <p className="text-gray-600">View trip itinerary</p>
                </div>
                <div className="text-gray-400 text-2xl">›</div>
              </div>
            </div>
          </Link>

          {/* Lucky Draw Feature */}
          <Link href="/lucky-draw">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow active:scale-95 transition-transform">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎁</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">Lucky Draw</h2>
                  <p className="text-gray-600">Christmas gift wheel</p>
                </div>
                <div className="text-gray-400 text-2xl">›</div>
              </div>
            </div>
          </Link>

          {/* Feature 3 (Coming Soon) */}
          <div className="bg-gray-100 rounded-2xl shadow-lg p-6 opacity-60">
            <div className="flex items-center gap-4">
              <div className="text-5xl">✨</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-600">Feature 3</h2>
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Share this link with family members</p>
          <p className="mt-2 text-xs">No login required 🎉</p>
        </div>
      </div>
    </div>
  );
}
