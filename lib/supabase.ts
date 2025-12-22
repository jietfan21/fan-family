import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseClient: SupabaseClient | null = null;

function initSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch {
    return null;
  }
}

export function getSupabase(): SupabaseClient {
  const client = initSupabase();
  if (!client) {
    throw new Error("Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return client;
}

// For backwards compatibility
export const supabase = null as SupabaseClient | null;

// Types for our database
export type Member = {
  id: string;
  password: string;
  name: string;
  emoji: string | null;
  is_dev: boolean;
  created_at: string;
  family_id: number | null;
  role: "dad" | "mom" | "kid" | null;
  partner_id: string | null;
  is_joining: boolean;
};

export type Family = {
  id: number;
  name: string;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  day_id: string;
  prompt: string;
  type: "mc" | "number";
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  created_at: string;
};

export type QuizAnswer = {
  id: string;
  member_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean | null;
  points_earned: number;
  submitted_at: string;
};

export type MemberRanking = {
  id: string;
  name: string;
  emoji: string | null;
  total_points: number;
  correct_answers: number;
  total_answers: number;
};
