import type { Household } from "./types";

function bmi(height_cm: number | null, weight_kg: number | null): string | null {
  if (!height_cm || !weight_kg) return null;
  const h = height_cm / 100;
  const val = weight_kg / (h * h);
  return val.toFixed(1);
}

function bmiCategory(bmiVal: string | null): string {
  if (!bmiVal) return "";
  const v = parseFloat(bmiVal);
  if (v < 18.5) return "underweight";
  if (v < 25) return "healthy weight";
  if (v < 30) return "overweight";
  return "obese";
}

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: "vegetarian (no meat, fish, or eggs)",
  eggetarian: "eggetarian (no meat or fish, but eats eggs)",
  non_vegetarian: "non-vegetarian (eats meat, fish, and eggs)",
};

// Maps meal_time → number of meals to suggest
function mealCountHint(mealTime: string): string {
  if (mealTime === "today") return "3–4 meals (breakfast, lunch, dinner or snack)";
  if (mealTime === "week") return "14–21 meals spread across 7 days (breakfast, lunch, dinner per day)";
  return "3–5 meal options";
}

export function buildSuggestPrompt(
  household: Household,
  mealTime: string
): { system: string; user: string } {
  const system = `You are an expert in Indian home cooking across all regions of India. \
Your job is to suggest practical, home-cookable dishes a family can realistically prepare. \
Prioritise authentic regional flavours, everyday ingredients, variety, and nutrition. \
Use commonly known bilingual names (e.g. "Aloo Gobi", "Moong Dal Khichdi", "Poha"). \
Respect all dietary restrictions strictly. \
Output ONLY valid JSON matching the exact schema — no markdown, no extra keys.`;

  const cuisineList =
    household.cuisines.length > 0
      ? household.cuisines.join(", ")
      : "pan-Indian";

  const fusionList =
    household.fusion_days.length > 0
      ? `fusion / international meals on: ${household.fusion_days.join(", ")}`
      : "no fusion days (stick to Indian cooking)";

  const fishNote =
    household.dietary_type === "non_vegetarian"
      ? household.include_fish
        ? "includes fish/seafood"
        : "no fish/seafood"
      : "";

  const kidsNote = household.has_kids
    ? "family has young children — include 1–2 kid-friendly, mild meals per day"
    : "";

  const bmiVal = bmi(household.height_cm, household.weight_kg);
  const bmiNote = bmiVal
    ? `BMI: ${bmiVal} (${bmiCategory(bmiVal)})`
    : "BMI: not provided";

  const healthNote = household.health_goal
    ? `Health goal: ${household.health_goal}`
    : "No specific health goal";

  const dislikes =
    household.disliked_ingredients.length > 0
      ? household.disliked_ingredients.join(", ")
      : "none";

  const notes = household.notes?.trim() || "none";

  const mealCount = mealCountHint(mealTime);

  const user = `Household profile:
- Dietary type: ${DIETARY_LABEL[household.dietary_type] ?? household.dietary_type}
- Preferred cuisines: ${cuisineList}
- Fusion preference: ${fusionList}
${fishNote ? `- Fish/seafood: ${fishNote}` : ""}\
${kidsNote ? `\n- Kids: ${kidsNote}` : ""}
- ${bmiNote}
- ${healthNote}
- Disliked/avoided ingredients: ${dislikes}
- Additional notes: ${notes}

Today's request:
- Meal time / scope: ${mealTime}
- Number of meals needed: ${mealCount}

Generate exactly the right number of meal objects for "${mealTime}". \
Each meal must have: meal_type (Breakfast/Lunch/Dinner/Snack), day (e.g. "Today", "Monday", "Tuesday" …), \
name, description (1 sentence), protein (e.g. "18g"), carbs (e.g. "42g"), calories (e.g. "320 kcal"), \
why_healthy (1 sentence), how_to_make (array of 3–4 short steps), kid_friendly (boolean), \
tags (array of 2–4 short strings like "High Protein", "Quick", "Vegan", "Gluten-Free").`;

  return { system, user };
}

export const MEAL_PLAN_SCHEMA = {
  type: "object",
  properties: {
    greeting: { type: "string" },
    tip: { type: "string" },
    meals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          meal_type: { type: "string" },
          day: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          protein: { type: "string" },
          carbs: { type: "string" },
          calories: { type: "string" },
          why_healthy: { type: "string" },
          how_to_make: { type: "array", items: { type: "string" } },
          kid_friendly: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: [
          "meal_type","day","name","description","protein","carbs",
          "calories","why_healthy","how_to_make","kid_friendly","tags",
        ],
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  required: ["greeting", "tip", "meals"],
  additionalProperties: false,
} as const;
