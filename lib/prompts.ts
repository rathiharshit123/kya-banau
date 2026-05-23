import type { Household, MealHistoryItem, MealType, Mood } from "./types";

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: "vegetarian (no meat/fish/eggs)",
  non_vegetarian: "non-vegetarian (eats meat, fish, eggs)",
  eggetarian: "eggetarian (no meat/fish, but eats eggs)",
  jain: "Jain (strict vegetarian, no root vegetables like onion/garlic/potato)",
};

const CUISINE_LABEL: Record<string, string> = {
  north_indian: "North Indian",
  south_indian: "South Indian",
  west_indian: "West Indian (Gujarati/Maharashtrian/Goan)",
  east_indian: "East Indian (Bengali/Odia/Assamese)",
  pan_indian: "Pan-Indian",
};

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function buildSuggestPrompt(
  household: Household,
  history: MealHistoryItem[],
  mealType: MealType,
  moods: Mood[]
): { system: string; user: string } {
  const system = `You are an expert in Indian home cooking across all regions of India. \
Your job is to suggest practical, home-cookable dishes that a family can realistically prepare today. \
Prioritise authentic regional flavours, everyday ingredients, and variety. \
Avoid repeating meals the family has eaten recently. \
Use commonly known bilingual names where they exist (e.g. "Aloo Gobi", "Moong Dal Khichdi", "Poha"). \
Output ONLY valid JSON matching the exact schema provided — no markdown, no extra fields.`;

  const recentMeals =
    history.length > 0
      ? history
          .map(
            (m) =>
              `- ${m.meal_name} (${m.meal_type}, ${new Date(m.eaten_at).toLocaleDateString("en-IN")})`
          )
          .join("\n")
      : "None in the last 14 days";

  const moodStr = moods.length > 0 ? moods.join(", ") : "no particular preference";

  const user = `Household profile:
- Dietary type: ${DIETARY_LABEL[household.dietary_type] ?? household.dietary_type}
- Regional preference: ${CUISINE_LABEL[household.regional_cuisine] ?? household.regional_cuisine}
- Spice level: ${household.spice_level}/5 (1=very mild, 5=very spicy)
- Family size: ${household.family_size} people
- Loved dishes: ${household.loved_dishes.length > 0 ? household.loved_dishes.join(", ") : "not specified"}
- Disliked dishes: ${household.disliked_dishes.length > 0 ? household.disliked_dishes.join(", ") : "none"}
- Disliked ingredients: ${household.disliked_ingredients.length > 0 ? household.disliked_ingredients.join(", ") : "none"}
- Notes: ${household.notes || "none"}

Today's meal request:
- Meal type: ${MEAL_LABEL[mealType]}
- Mood / preference: ${moodStr}

Meals eaten in the last 14 days (DO NOT repeat these):
${recentMeals}

Give exactly 4 suggestions for ${MEAL_LABEL[mealType]} that fit this family's profile and today's mood. \
Each suggestion must have: name, why (1 sentence referencing their profile or mood), effort (quick/medium/involved), hero_ingredient.`;

  return { system, user };
}

export const SUGGESTION_SCHEMA = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          why: { type: "string" },
          effort: { type: "string", enum: ["quick", "medium", "involved"] },
          hero_ingredient: { type: "string" },
        },
        required: ["name", "why", "effort", "hero_ingredient"],
        additionalProperties: false,
      },
      minItems: 4,
      maxItems: 4,
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
} as const;
