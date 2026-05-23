import React from "react";
import {
  calculateProteinGoal,
  formatProteinGoal,
  type ProteinGoal,
} from "@/lib/nutrition";

interface ProteinGoalCardProps {
  weightKg: number | null | undefined;
  healthGoal?: string | null;
}

export function ProteinGoalCard({ weightKg, healthGoal }: ProteinGoalCardProps) {
  const goal = calculateProteinGoal(weightKg, healthGoal);
  if (!goal) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 space-y-1"
      style={{
        background: "color-mix(in srgb, var(--color-accent) 10%, var(--color-card))",
        border: "1px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-border))",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          Daily protein target
        </span>
        <span className="font-bold text-sm" style={{ color: "var(--color-accent)" }}>
          {formatProteinGoal(goal)}
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {proteinGoalHint(goal)}
      </p>
    </div>
  );
}

function proteinGoalHint(goal: ProteinGoal): string {
  const perMealLow = Math.round(goal.minGrams / 3);
  const perMealHigh = Math.round(goal.maxGrams / 3);

  return `For ${goal.label} (~${goal.minPerKg}–${goal.maxPerKg}g per kg). Spread across meals — roughly ${perMealLow}–${perMealHigh}g per main meal.`;
}
