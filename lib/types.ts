import { z } from "zod";

export const DietaryTypeSchema = z.enum([
  "vegetarian",
  "non_vegetarian",
  "eggetarian",
  "jain",
]);
export type DietaryType = z.infer<typeof DietaryTypeSchema>;

export const RegionalCuisineSchema = z.enum([
  "north_indian",
  "south_indian",
  "west_indian",
  "east_indian",
  "pan_indian",
]);
export type RegionalCuisine = z.infer<typeof RegionalCuisineSchema>;

export const MealTypeSchema = z.enum(["breakfast", "lunch", "dinner"]);
export type MealType = z.infer<typeof MealTypeSchema>;

export const MoodSchema = z.enum([
  "quick",
  "light",
  "healthy",
  "tasty",
  "comfort",
  "fancy",
]);
export type Mood = z.infer<typeof MoodSchema>;

export const HouseholdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  dietary_type: DietaryTypeSchema,
  regional_cuisine: RegionalCuisineSchema,
  spice_level: z.number().int().min(1).max(5),
  family_size: z.number().int().min(1),
  loved_dishes: z.array(z.string()),
  disliked_dishes: z.array(z.string()),
  disliked_ingredients: z.array(z.string()),
  notes: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Household = z.infer<typeof HouseholdSchema>;

export const HouseholdUpsertSchema = z.object({
  name: z.string().optional(),
  dietary_type: DietaryTypeSchema.optional(),
  regional_cuisine: RegionalCuisineSchema.optional(),
  spice_level: z.number().int().min(1).max(5).optional(),
  family_size: z.number().int().min(1).optional(),
  loved_dishes: z.array(z.string()).optional(),
  disliked_dishes: z.array(z.string()).optional(),
  disliked_ingredients: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type HouseholdUpsert = z.infer<typeof HouseholdUpsertSchema>;

export const SuggestionItemSchema = z.object({
  name: z.string(),
  why: z.string(),
  effort: z.enum(["quick", "medium", "involved"]),
  hero_ingredient: z.string(),
});
export type SuggestionItem = z.infer<typeof SuggestionItemSchema>;

export const SuggestRequestSchema = z.object({
  meal_type: MealTypeSchema,
  moods: z.array(MoodSchema),
});
export type SuggestRequest = z.infer<typeof SuggestRequestSchema>;

export const MealLogSchema = z.object({
  meal_name: z.string().min(1),
  meal_type: MealTypeSchema,
  source: z.enum(["manual", "suggested"]).default("manual"),
  rating: z.number().int().min(1).max(5).optional(),
  suggestion_id: z.string().uuid().optional(),
});
export type MealLog = z.infer<typeof MealLogSchema>;

export const MealHistoryItemSchema = z.object({
  id: z.string().uuid(),
  household_id: z.string().uuid(),
  meal_name: z.string(),
  meal_type: z.string(),
  source: z.string(),
  rating: z.number().nullable(),
  eaten_at: z.string(),
});
export type MealHistoryItem = z.infer<typeof MealHistoryItemSchema>;

export const DIETARY_LABELS: Record<DietaryType, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-Vegetarian",
  eggetarian: "Eggetarian",
  jain: "Jain",
};

export const CUISINE_LABELS: Record<RegionalCuisine, string> = {
  north_indian: "North Indian",
  south_indian: "South Indian",
  west_indian: "West Indian",
  east_indian: "East Indian",
  pan_indian: "Pan-Indian",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  breakfast: "☀️",
  lunch: "🌤️",
  dinner: "🌙",
};
