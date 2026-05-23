"use client";

import React, { useState } from "react";
import { Check, ChefHat, Zap, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SuggestionItem } from "@/lib/types";

const EFFORT_CONFIG = {
  quick: { label: "Quick", icon: Zap, color: "text-green-600 bg-green-50" },
  medium: { label: "Medium", icon: Clock, color: "text-amber-600 bg-amber-50" },
  involved: { label: "Involved", icon: Flame, color: "text-red-600 bg-red-50" },
};

interface MealSuggestionCardProps {
  suggestion: SuggestionItem;
  index: number;
  onPick: (name: string) => Promise<void>;
}

export function MealSuggestionCard({
  suggestion,
  index,
  onPick,
}: MealSuggestionCardProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const effort = EFFORT_CONFIG[suggestion.effort];
  const EffortIcon = effort.icon;

  async function handlePick() {
    setLoading(true);
    try {
      await onPick(suggestion.name);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="meal-card group relative rounded-2xl border-2 border-charcoal/10 bg-cream/80 p-5 shadow-sm hover:shadow-md hover:border-terracotta/30 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Hero ingredient badge */}
      <div className="absolute -top-3 right-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/20 border border-saffron/40 px-3 py-1 text-xs font-semibold text-amber-800">
          <ChefHat className="h-3 w-3" />
          {suggestion.hero_ingredient}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 mt-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-charcoal leading-snug">
            {suggestion.name}
          </h3>
          <p className="mt-1.5 text-sm text-charcoal/60 leading-relaxed">
            {suggestion.why}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold",
            effort.color
          )}
        >
          <EffortIcon className="h-3 w-3" />
          {effort.label}
        </span>
      </div>

      <div className="mt-4">
        <Button
          onClick={handlePick}
          disabled={loading || done}
          variant={done ? "secondary" : "default"}
          size="sm"
          className="w-full"
        >
          {done ? (
            <>
              <Check className="h-4 w-4" /> Added to History
            </>
          ) : loading ? (
            "Logging..."
          ) : (
            "I'll make this!"
          )}
        </Button>
      </div>
    </div>
  );
}
