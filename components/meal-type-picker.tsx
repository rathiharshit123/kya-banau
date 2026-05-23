"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { MealType } from "@/lib/types";

const MEAL_TYPES: { value: MealType; label: string; emoji: string; time: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "☀️", time: "Morning" },
  { value: "lunch", label: "Lunch", emoji: "🌤️", time: "Afternoon" },
  { value: "dinner", label: "Dinner", emoji: "🌙", time: "Evening" },
];

interface MealTypePickerProps {
  value: MealType | null;
  onChange: (value: MealType) => void;
}

export function MealTypePicker({ value, onChange }: MealTypePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MEAL_TYPES.map((mt) => (
        <button
          key={mt.value}
          type="button"
          onClick={() => onChange(mt.value)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-2xl border-2 py-4 px-2 transition-all duration-200 active:scale-95",
            value === mt.value
              ? "border-terracotta bg-terracotta/10 shadow-md"
              : "border-charcoal/15 bg-cream/60 hover:border-charcoal/30"
          )}
        >
          <span className="text-2xl">{mt.emoji}</span>
          <span
            className={cn(
              "text-sm font-bold",
              value === mt.value ? "text-terracotta" : "text-charcoal"
            )}
          >
            {mt.label}
          </span>
          <span className="text-xs text-charcoal/50">{mt.time}</span>
        </button>
      ))}
    </div>
  );
}
