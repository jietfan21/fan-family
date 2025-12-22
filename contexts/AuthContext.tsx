"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getSupabase, Member } from "@/lib/supabase";

type AuthContextType = {
  member: Member | null;
  isLoading: boolean;
  isFirstLogin: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateEmoji: (emoji: string) => Promise<boolean>;
  setFirstLoginComplete: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "fan-family-member";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMember(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("password", password)
        .single();

      if (error || !data) {
        return { success: false, error: "Invalid birthdate. Please try again." };
      }

      setMember(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Check if first login (no emoji set)
      if (!data.emoji) {
        setIsFirstLogin(true);
      }

      return { success: true };
    } catch {
      return { success: false, error: "Connection error. Please try again." };
    }
  };

  const logout = () => {
    setMember(null);
    setIsFirstLogin(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateEmoji = async (emoji: string): Promise<boolean> => {
    if (!member) return false;

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("members")
        .update({ emoji })
        .eq("id", member.id);

      if (error) return false;

      const updatedMember = { ...member, emoji };
      setMember(updatedMember);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMember));
      return true;
    } catch {
      return false;
    }
  };

  const setFirstLoginComplete = () => {
    setIsFirstLogin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        isLoading,
        isFirstLogin,
        login,
        logout,
        updateEmoji,
        setFirstLoginComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
