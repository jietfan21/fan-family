"use client";

import { Member } from "@/lib/supabase";
import { getFamilyTree, FamilyTreeData } from "@/lib/familyTree";

type MemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  displayName: string;
  allMembers?: Member[];
};

function FamilyMemberNode({
  member,
  isHighlighted,
  label,
}: {
  member: Member;
  isHighlighted: boolean;
  label?: string;
}) {
  const isNotJoining = member.is_joining === false;

  return (
    <div
      className={`flex flex-col items-center ${isNotJoining ? "opacity-40" : ""}`}
    >
      {label && (
        <span className="text-[10px] text-gray-400 mb-0.5">{label}</span>
      )}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
          isHighlighted
            ? "bg-gradient-to-r from-red-500 to-green-500 text-white font-bold"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {member.emoji && <span>{member.emoji}</span>}
        <span>{member.name}</span>
      </div>
      {isNotJoining && (
        <span className="text-[9px] text-gray-400 mt-0.5">not joining</span>
      )}
    </div>
  );
}

function FamilyTree({
  treeData,
  highlightedMemberId,
}: {
  treeData: FamilyTreeData;
  highlightedMemberId: string;
}) {
  const { parents, kids } = treeData;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Parents row */}
      {(parents.dad || parents.mom) && (
        <>
          <div className="flex items-center gap-3">
            {parents.dad && (
              <FamilyMemberNode
                member={parents.dad}
                isHighlighted={parents.dad.id === highlightedMemberId}
                label="Dad"
              />
            )}
            {parents.dad && parents.mom && (
              <span className="text-gray-300">♥</span>
            )}
            {parents.mom && (
              <FamilyMemberNode
                member={parents.mom}
                isHighlighted={parents.mom.id === highlightedMemberId}
                label="Mom"
              />
            )}
          </div>

          {/* Connecting line */}
          <div className="w-0.5 h-3 bg-gray-200"></div>
        </>
      )}

      {/* Kids row(s) */}
      <div className="flex flex-wrap justify-center gap-2">
        {kids.map(({ member, partner }) => (
          <div key={member.id} className="flex items-center gap-1">
            <FamilyMemberNode
              member={member}
              isHighlighted={member.id === highlightedMemberId}
            />
            {partner && (
              <>
                <span className="text-gray-300 text-xs">+</span>
                <FamilyMemberNode
                  member={partner}
                  isHighlighted={partner.id === highlightedMemberId}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MemberModal({
  isOpen,
  onClose,
  member,
  displayName,
  allMembers = [],
}: MemberModalProps) {
  if (!isOpen) return null;

  const familyTree = member ? getFamilyTree(member, allMembers) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-500 to-green-500 p-6 text-white text-center">
          {member?.emoji ? (
            <div className="text-6xl mb-2">{member.emoji}</div>
          ) : (
            <div className="text-6xl mb-2 opacity-50">👤</div>
          )}
          <h2 className="text-xl font-bold">{member?.name || displayName}</h2>
        </div>

        <div className="p-4">
          {member ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${member.is_joining !== false ? "text-green-600" : "text-gray-400"}`}
                >
                  {member.is_joining !== false ? "✓ Joining" : "✗ Not joining"}
                </span>
              </div>

              {/* Family Tree Section */}
              {familyTree && (
                <div className="pt-3 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
                    Family Tree
                  </h3>
                  <FamilyTree
                    treeData={familyTree}
                    highlightedMemberId={member.id}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                This member hasn&apos;t registered yet
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-semibold rounded-xl transition-all hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
