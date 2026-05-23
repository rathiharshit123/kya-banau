"use client";

import React from "react";
import { Copy, MessageCircle } from "lucide-react";
import type { Meal, MealTime } from "@/lib/types";

export type FilterId = "all" | "today" | "week" | "breakfast" | "lunch" | "dinner";

interface ResultsFilterProps {
  meals: Meal[];
  mealTime: MealTime | null;
  active: FilterId;
  onChange: (f: FilterId) => void;
  onWhatsAppShare: () => void;
  onCopyShare: () => void;
  sharing?: boolean;
}

const FILTER_LABELS: Record<FilterId, string> = {
  all: "All",
  today: "Today",
  week: "This Week",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function shouldShowMealFilters(mealTime: MealTime | null): boolean {
  return mealTime === "today" || mealTime === "week";
}

function getVisibleFilters(mealTime: MealTime, meals: Meal[]): FilterId[] {
  const options: FilterId[] = ["all"];

  if (mealTime === "today") {
    for (const type of ["breakfast", "lunch", "dinner"] as const) {
      if (meals.some((m) => m.meal_type.toLowerCase() === type)) {
        options.push(type);
      }
    }
    return options;
  }

  if (mealTime === "week") {
    for (const type of ["breakfast", "lunch", "dinner"] as const) {
      if (meals.some((m) => m.meal_type.toLowerCase() === type)) {
        options.push(type);
      }
    }

    const hasToday = meals.some((m) => m.day === "Today");
    const hasOtherDays = meals.some((m) => m.day !== "Today");
    if (hasToday && hasOtherDays) {
      options.push("today", "week");
    }

    return options;
  }

  return options;
}

export function ResultsFilter({
  meals,
  mealTime,
  active,
  onChange,
  onWhatsAppShare,
  onCopyShare,
  sharing = false,
}: ResultsFilterProps) {
  const filterIds =
    shouldShowMealFilters(mealTime) && mealTime
      ? getVisibleFilters(mealTime, meals)
      : [];
  const showFilterRow = filterIds.length > 1;

  return (
    <div className="flex items-center gap-2">
      {showFilterRow ? (
        <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`filter-btn flex-shrink-0${active === id ? " active" : ""}`}
            >
              {FILTER_LABELS[id]}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1" />
      )}
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

export function filterMeals(
  meals: Meal[],
  active: FilterId,
  mealTime?: MealTime | null,
): Meal[] {
  if (!shouldShowMealFilters(mealTime ?? null) || active === "all") return meals;
  if (active === "today") {
    const todayMeals = meals.filter((m) => m.day === "Today");
    return todayMeals.length > 0 ? todayMeals : meals;
  }
  if (active === "week") return meals.filter((m) => m.day !== "Today");
  return meals.filter((m) => m.meal_type.toLowerCase() === active);
}
