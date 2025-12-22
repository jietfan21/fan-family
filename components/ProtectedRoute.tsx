"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !member) {
      router.push("/login");
    }
  }, [member, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🌴</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return <>{children}</>;
}
