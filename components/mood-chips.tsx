"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Mood } from "@/lib/types";

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "quick", label: "Quick", emoji: "⚡" },
  { value: "light", label: "Light", emoji: "🥗" },
  { value: "healthy", label: "Healthy", emoji: "💚" },
  { value: "tasty", label: "Tasty", emoji: "😋" },
  { value: "comfort", label: "Comfort", emoji: "🤗" },
  { value: "fancy", label: "Fancy", emoji: "✨" },
];

interface MoodChipsProps {
  value: Mood[];
  onChange: (value: Mood[]) => void;
}

export function MoodChips({ value, onChange }: MoodChipsProps) {
  function toggle(mood: Mood) {
    if (value.includes(mood)) {
      onChange(value.filter((m) => m !== mood));
    } else {
      onChange([...value, mood]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => {
        const active = value.includes(mood.value);
        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => toggle(mood.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
              active
                ? "border-terracotta bg-terracotta text-cream shadow-md"
                : "border-charcoal/20 bg-cream/60 text-charcoal hover:border-charcoal/40"
            )}
          >
            <span>{mood.emoji}</span>
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
