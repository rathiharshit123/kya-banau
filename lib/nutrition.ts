const PROTEIN_BY_GOAL: Record<
  string,
  { minPerKg: number; maxPerKg: number; label: string }
> = {
  muscle_gain: { minPerKg: 1.6, maxPerKg: 2.0, label: "muscle gain & gym" },
  weight_loss: { minPerKg: 1.2, maxPerKg: 1.6, label: "weight loss" },
  heart_health: { minPerKg: 0.9, maxPerKg: 1.1, label: "heart health" },
  diabetic_friendly: { minPerKg: 1.0, maxPerKg: 1.2, label: "blood sugar balance" },
  gut_health: { minPerKg: 0.9, maxPerKg: 1.0, label: "general wellness" },
  energy_boost: { minPerKg: 1.1, maxPerKg: 1.3, label: "sustained energy" },
};

const DEFAULT_PROTEIN = {
  minPerKg: 0.8,
  maxPerKg: 1.0,
  label: "everyday lifestyle",
};

export interface ProteinGoal {
  minGrams: number;
  maxGrams: number;
  minPerKg: number;
  maxPerKg: number;
  label: string;
}

export function calculateProteinGoal(
  weightKg: number | null | undefined,
  healthGoal?: string | null,
): ProteinGoal | null {
  if (!weightKg || weightKg <= 0) return null;

  const config = (healthGoal && PROTEIN_BY_GOAL[healthGoal]) || DEFAULT_PROTEIN;

  return {
    minGrams: Math.round(weightKg * config.minPerKg),
    maxGrams: Math.round(weightKg * config.maxPerKg),
    minPerKg: config.minPerKg,
    maxPerKg: config.maxPerKg,
    label: config.label,
  };
}

export function formatProteinGoal(goal: ProteinGoal): string {
  return `${goal.minGrams}–${goal.maxGrams}g per day`;
}

export function formatProteinGoalDetail(goal: ProteinGoal): string {
  return `Aim for ${formatProteinGoal(goal)} (${goal.minPerKg}–${goal.maxPerKg}g per kg) for ${goal.label}.`;
}
