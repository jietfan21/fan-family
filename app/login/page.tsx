"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length !== 8) {
      setError("Please enter 8 digits (YYYYMMDD)");
      return;
    }

    if (!/^\d{8}$/.test(password)) {
      setError("Only numbers allowed");
      return;
    }

    setIsLoading(true);
    const result = await login(password);
    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20">🌴</div>
        <div className="absolute top-20 right-10 text-5xl opacity-20">🌺</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-20">🌊</div>
        <div className="absolute bottom-10 right-20 text-5xl opacity-20">🐚</div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌴</div>
          <h1 className="text-2xl font-bold text-[#011a42]">
            Bali Family Trip
          </h1>
          <p className="text-[#00b4fb] text-sm mt-1 font-medium">
            Dec 22-27, 2025
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#011a42] mb-2">
              Enter your birthdate
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={password}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPassword(val);
                setError("");
              }}
              placeholder="YYYYMMDD"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-200 rounded-xl focus:border-[#00b4fb] focus:outline-none transition-colors text-[#011a42]"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Example: 19901225
            </p>
          </div>

          {error && (
            <div className="bg-[#fa655f]/10 text-[#fa655f] text-sm p-3 rounded-lg text-center border border-[#fa655f]/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || password.length !== 8}
            className="w-full py-3 bg-[#00b4fb] hover:bg-[#0090cc] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Enter Trip App"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          27 Family Members
        </p>
      </div>
    </div>
  );
}
