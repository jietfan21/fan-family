import { Member } from "./supabase";

export type FamilyTreeData = {
  parents: { dad: Member | null; mom: Member | null };
  kids: { member: Member; partner: Member | null }[];
};

// Hardcoded non-joining members (not in database)
const NON_JOINING_MEMBERS: Record<number, Member[]> = {
  3: [
    {
      id: "non-joining-chong-ern",
      password: "",
      name: "Chong Ern",
      emoji: null,
      is_dev: false,
      created_at: "",
      family_id: 3,
      role: "kid",
      partner_id: null,
      is_joining: false,
    },
  ],
  4: [
    {
      id: "non-joining-chong-yee",
      password: "",
      name: "Chong Yee",
      emoji: null,
      is_dev: false,
      created_at: "",
      family_id: 4,
      role: "kid",
      partner_id: null,
      is_joining: false,
    },
  ],
};

// Get the family tree for a specific member
export function getFamilyTree(
  member: Member,
  allMembers: Member[]
): FamilyTreeData | null {
  if (!member.family_id) return null;

  // Get all family members from database
  const dbFamilyMembers = allMembers.filter(
    (m) => m.family_id === member.family_id
  );

  // Add hardcoded non-joining members for this family
  const nonJoiningForFamily = NON_JOINING_MEMBERS[member.family_id] || [];
  const familyMembers = [...dbFamilyMembers, ...nonJoiningForFamily];

  // Find parents
  const dad = familyMembers.find((m) => m.role === "dad") || null;
  const mom = familyMembers.find((m) => m.role === "mom") || null;

  // Find kids and their partners
  const kidMembers = familyMembers.filter((m) => m.role === "kid");

  // Group kids with their partners
  const processedIds = new Set<string>();
  const kids: { member: Member; partner: Member | null }[] = [];

  for (const kid of kidMembers) {
    if (processedIds.has(kid.id)) continue;

    processedIds.add(kid.id);

    // Find partner if exists
    let partner: Member | null = null;
    if (kid.partner_id) {
      partner = allMembers.find((m) => m.id === kid.partner_id) || null;
      if (partner) {
        processedIds.add(partner.id);
      }
    }

    // Determine who should be listed first (original family member vs partner who married in)
    // Partners who married in have the same family_id as the original kid
    // We identify original kids by checking if their partner has a different family background
    // For simplicity, use alphabetical order or the one without a partner_id pointing to them
    const isOriginalFamilyMember = kidMembers.some(
      (k) => k.id === kid.id && !kidMembers.some((other) => other.partner_id === kid.id)
    );

    if (isOriginalFamilyMember || !partner) {
      kids.push({ member: kid, partner });
    } else {
      // Partner is the original family member, swap them
      kids.push({ member: partner, partner: kid });
    }
  }

  // Sort kids: original family members first (those whose partners married in)
  // This ensures 聪颖 shows before 阿辉, etc.
  kids.sort((a, b) => {
    // Non-partners (single kids) and original family members first
    const aIsOriginal = !a.partner || a.member.name !== a.partner?.name;
    const bIsOriginal = !b.partner || b.member.name !== b.partner?.name;
    if (aIsOriginal && !bIsOriginal) return -1;
    if (!aIsOriginal && bIsOriginal) return 1;
    return a.member.name.localeCompare(b.member.name);
  });

  return { parents: { dad, mom }, kids };
}

// Check if a member is highlighted in the tree (the one being viewed)
export function isMemberHighlighted(
  memberId: string,
  targetMember: Member
): boolean {
  return memberId === targetMember.id;
}
