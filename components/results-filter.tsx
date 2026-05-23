"use client";

import React from "react";
import { Copy, MessageCircle } from "lucide-react";
import type { Meal } from "@/lib/types";

type FilterId = "all" | "today" | "week" | "breakfast" | "lunch" | "dinner";

interface ResultsFilterProps {
  meals: Meal[];
  active: FilterId;
  onChange: (f: FilterId) => void;
  onWhatsAppShare: () => void;
  onCopyShare: () => void;
  sharing?: boolean;
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

export function ResultsFilter({
  meals,
  active,
  onChange,
  onWhatsAppShare,
  onCopyShare,
  sharing = false,
}: ResultsFilterProps) {
  // Only show filters that have matching meals
  const visibleFilters = FILTERS.filter((f) => {
    if (f.id === "all") return true;
    if (f.id === "today") return meals.some((m) => m.day === "Today");
    if (f.id === "week") return meals.some((m) => m.day !== "Today");
    return meals.some((m) => m.meal_type.toLowerCase() === f.id);
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {visibleFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`filter-btn flex-shrink-0${active === f.id ? " active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onCopyShare}
          disabled={sharing}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
          style={{
            border: "1.5px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
          title="Copy for family group"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
        <button
          type="button"
          onClick={onWhatsAppShare}
          disabled={sharing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "#25D366",
            color: "#fff",
          }}
          title="Share on WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </button>
      </div>
    </div>
  );
}

export function filterMeals(meals: Meal[], active: FilterId): Meal[] {
  if (active === "all") return meals;
  if (active === "today") {
    const todayMeals = meals.filter((m) => m.day === "Today");
    return todayMeals.length > 0 ? todayMeals : meals;
  }
  if (active === "week") return meals.filter((m) => m.day !== "Today");
  return meals.filter((m) => m.meal_type.toLowerCase() === active);
}
