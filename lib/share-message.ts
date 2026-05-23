import type { Meal } from "@/lib/types";

type ShareFilter = "all" | "today" | "week" | "breakfast" | "lunch" | "dinner";

const MEAL_TYPE_EMOJI: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🌤️",
  dinner: "🌙",
  snack: "🍎",
};

export function getShareTitle(meals: Meal[], filter: ShareFilter = "all"): string {
  return shareTitle(meals, filter);
}

function shareTitle(meals: Meal[], filter: ShareFilter): string {
  if (filter === "breakfast" || filter === "lunch" || filter === "dinner") {
    const label = filter.charAt(0).toUpperCase() + filter.slice(1);
    return `${label} suggestions ${MEAL_TYPE_EMOJI[filter] ?? "🍽️"}`;
  }

  const types = [...new Set(meals.map((m) => m.meal_type.toLowerCase()))];
  if (types.length === 1) {
    const type = types[0]!;
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    return `${label} suggestions ${MEAL_TYPE_EMOJI[type] ?? "🍽️"}`;
  }

  const allToday = meals.every((m) => m.day === "Today");
  if (allToday) return "Aaj kya banau? 🍽️";

  return "Meal plan from Kya Banau? 📅";
}

function formatMealLine(meal: Meal, index: number, meals: Meal[]): string {
  const prefix = meals.length > 1 ? `${index + 1}. ` : "";
  const showDay = meals.some((m) => m.day !== meals[0]?.day);
  const showType =
    meals.some((m) => m.meal_type !== meals[0]?.meal_type) && meals.length > 1;

  let suffix = "";
  if (showDay && showType) suffix = ` (${meal.day} · ${meal.meal_type})`;
  else if (showDay) suffix = ` (${meal.day})`;
  else if (showType) suffix = ` (${meal.meal_type})`;

  return `${prefix}${meal.name}${suffix}`;
}

function formatReasons(tip: string | null | undefined, meals: Meal[]): string {
  if (tip?.trim()) {
    const parts = tip
      .split(/[,;]\s+|\n+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length > 1) {
      return parts.map((part) => `- ${part.replace(/^[-•]\s*/, "")}`).join("\n");
    }

    return `- ${tip.trim()}`;
  }

  const reasons = [
    ...new Set(meals.map((m) => m.why_healthy.trim()).filter(Boolean)),
  ].slice(0, 3);

  if (reasons.length === 0) return "";
  return reasons.map((reason) => `- ${reason}`).join("\n");
}

export function buildFamilyGroupShareMessage(
  meals: Meal[],
  options?: { tip?: string | null; filter?: ShareFilter; pollUrl?: string | null },
): string {
  if (meals.length === 0) return "";

  const filter = options?.filter ?? "all";
  const title = shareTitle(meals, filter);
  const list = meals.map((meal, i) => formatMealLine(meal, i, meals)).join("\n");
  const reasons = formatReasons(options?.tip, meals);

  let message = `${title}\n\n${list}`;

  if (reasons) {
    message += `\n\nRecommended because:\n${reasons}`;
  }

  if (options?.pollUrl) {
    message += `\n\nVote karo 👇\n${options.pollUrl}`;
  }

  return message;
}

export function openWhatsAppShare(message: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}
