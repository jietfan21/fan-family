"use client";

import { useState } from "react";

const EMOJI_OPTIONS = [
  "😀", "😎", "🥳", "😍", "🤩", "😇", "🥰", "😊",
  "🤗", "😋", "😜", "🤪", "😈", "👻", "🎃", "🦄",
  "🐶", "🐱", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵",
  "🌴", "🌺", "🌸", "🌻", "🌈", "⭐", "🔥", "💎",
  "🎄", "🎅", "🤶", "🎁", "❄️", "⛄", "🦌", "🔔",
];

type EmojiPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
};

export default function EmojiPicker({
  isOpen,
  onClose,
  onSelect,
  currentEmoji,
}: EmojiPickerProps) {
  const [selected, setSelected] = useState(currentEmoji || "");

  if (!isOpen) return null;

  const handleSelect = (emoji: string) => {
    setSelected(emoji);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-white text-center">
          <h2 className="text-xl font-bold">Choose Your Avatar</h2>
          <p className="text-sm opacity-90">Pick an emoji to represent you</p>
        </div>

        <div className="p-4">
          {selected && (
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{selected}</div>
              <p className="text-sm text-gray-500">Your selection</p>
            </div>
          )}

          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  selected === emoji
                    ? "bg-teal-100 scale-110 ring-2 ring-teal-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 font-medium rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
