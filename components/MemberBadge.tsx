"use client";

import { Member } from "@/lib/supabase";
import { findMemberByName } from "@/lib/chineseNormalize";

type MemberBadgeProps = {
  name: string;
  members: Member[];
  onClick?: (member: Member | null, displayName: string) => void;
  className?: string;
};

export default function MemberBadge({
  name,
  members,
  onClick,
  className = "",
}: MemberBadgeProps) {
  const member = findMemberByName(name, members);
  const emoji = member?.emoji;

  const handleClick = () => {
    if (onClick) {
      onClick(member || null, name);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 hover:bg-gray-200 rounded-lg px-1 -mx-1 transition-colors cursor-pointer ${className}`}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      <span className="text-[#011a42]">{name}</span>
    </button>
  );
}

// Helper to parse a room/group string that may contain multiple names
// e.g., "国雄 + Kris" or "Villa 1: 国强 + 君毓, Cikgu + 凤春"
// e.g., "聪颖 + 阿辉 (Extra bed: 昌捷 + 炜婷)"
export function parseNamesFromString(str: string): string[] {
  const names: string[] = [];

  // First, extract and process parentheses content separately
  const parenMatch = str.match(/\(([^)]+)\)/);
  let mainPart = str;

  if (parenMatch) {
    // Remove parentheses from main string
    mainPart = str.replace(/\s*\([^)]+\)/, '');

    // Parse names inside parentheses
    const insideParen = parenMatch[1];
    const innerContent = insideParen.replace(/^Extra bed:\s*/i, '');
    const innerNames = innerContent
      .split(/[+,]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    names.push(...innerNames);
  }

  // Handle prefix like "Villa 1:" - extract it but don't add to names
  const prefixMatch = mainPart.match(/^([^:]+):\s*/);
  if (prefixMatch) {
    mainPart = mainPart.replace(/^[^:]+:\s*/, '');
  }

  // Split main part by + and ,
  const mainNames = mainPart
    .split(/[+,]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Add main names at the beginning (before parentheses names)
  names.unshift(...mainNames);

  return names;
}
