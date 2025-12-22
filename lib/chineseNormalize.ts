// Mapping of traditional Chinese characters to simplified Chinese characters
// This covers common characters used in the family member names
const traditionalToSimplified: Record<string, string> = {
  // Names appearing in arrangement page
  '國': '国',
  '強': '强',
  '鳳': '凤',
  '聰': '聪',
  '穎': '颖',
  '雲': '云',
  '瑩': '莹',
  '輝': '辉',
  '鴻': '鸿',
  '銘': '铭',
  '賢': '贤',
  '榮': '荣',
  '耀': '耀', // Same in both
  '婷': '婷', // Same in both
  '琳': '琳', // Same in both
  '容': '容', // Same in both
  '捷': '捷', // Same in both
  '煒': '炜', // Traditional to simplified for 炜婷
  '瑋': '玮', // Another variant
};

// Create reverse mapping
const simplifiedToTraditional: Record<string, string> = {};
for (const [trad, simp] of Object.entries(traditionalToSimplified)) {
  if (trad !== simp) {
    simplifiedToTraditional[simp] = trad;
  }
}

// Normalize a string to simplified Chinese for comparison
export function normalizeToSimplified(str: string): string {
  return str
    .split('')
    .map(char => traditionalToSimplified[char] || char)
    .join('')
    .toLowerCase();
}

// Check if two names match (fuzzy match with Chinese normalization)
export function namesMatch(name1: string, name2: string): boolean {
  const normalized1 = normalizeToSimplified(name1.trim());
  const normalized2 = normalizeToSimplified(name2.trim());
  return normalized1 === normalized2;
}

// Find a member by name from a list of members
export function findMemberByName<T extends { name: string }>(
  name: string,
  members: T[]
): T | undefined {
  return members.find(member => namesMatch(member.name, name));
}
