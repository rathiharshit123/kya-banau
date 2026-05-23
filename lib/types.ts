import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const DietaryTypeSchema = z.enum([
  "vegetarian",
  "eggetarian",
  "non_vegetarian",
]);
export type DietaryType = z.infer<typeof DietaryTypeSchema>;

export const MealTimeSchema = z.enum([
  "today",
  "breakfast",
  "lunch",
  "dinner",
  "week",
  "tiffin",
]);
export type MealTime = z.infer<typeof MealTimeSchema>;

// ─── Household ────────────────────────────────────────────────────────────────

export const HouseholdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  dietary_type: DietaryTypeSchema,
  cuisines: z.array(z.string()).default([]),
  fusion_days: z.array(z.string()).default([]),
  include_fish: z.boolean().default(false),
  has_kids: z.boolean().default(false),
  height_cm: z.number().nullable(),
  weight_kg: z.number().nullable(),
  health_goal: z.string().default(""),
  disliked_ingredients: z.array(z.string()).default([]),
  notes: z.string().default(""),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Household = z.infer<typeof HouseholdSchema>;

export const HouseholdUpsertSchema = z.object({
  name: z.string().optional(),
  dietary_type: DietaryTypeSchema.optional(),
  cuisines: z.array(z.string()).optional(),
  fusion_days: z.array(z.string()).optional(),
  include_fish: z.boolean().optional(),
  has_kids: z.boolean().optional(),
  height_cm: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  health_goal: z.string().optional(),
  disliked_ingredients: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type HouseholdUpsert = z.infer<typeof HouseholdUpsertSchema>;

// ─── Suggest request ──────────────────────────────────────────────────────────

export const SuggestRequestSchema = z.object({
  meal_time: MealTimeSchema,
});
export type SuggestRequest = z.infer<typeof SuggestRequestSchema>;

// ─── Meal plan response ───────────────────────────────────────────────────────

export const MealSchema = z.object({
  meal_type: z.string(),
  day: z.string(),
  name: z.string(),
  description: z.string(),
  protein: z.string(),
  carbs: z.string(),
  calories: z.string(),
  why_healthy: z.string(),
  how_to_make: z.array(z.string()),
  kid_friendly: z.boolean(),
  tags: z.array(z.string()),
});
export type Meal = z.infer<typeof MealSchema>;

export const MealPlanSchema = z.object({
  greeting: z.string(),
  tip: z.string(),
  meals: z.array(MealSchema),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

// ─── Recipe videos ────────────────────────────────────────────────────────────

export const RecipeVideosRequestSchema = z.object({
  dish_name: z.string().min(1).max(200),
  suggestion_id: z.string().uuid().optional().nullable(),
  meal_type: z.string().optional(),
  day: z.string().optional(),
});
export type RecipeVideosRequest = z.infer<typeof RecipeVideosRequestSchema>;

export const RecipeVideoSchema = z.object({
  video_id: z.string(),
  title: z.string(),
  thumbnail_url: z.string(),
  channel_name: z.string(),
  video_url: z.string().url(),
});
export type RecipeVideo = z.infer<typeof RecipeVideoSchema>;

export const RecipeVideosResponseSchema = z.object({
  videos: z.array(RecipeVideoSchema),
  query: z.string(),
});
export type RecipeVideosResponse = z.infer<typeof RecipeVideosResponseSchema>;

// ─── Meal interactions ────────────────────────────────────────────────────────

export const InteractionTypeSchema = z.enum([
  "quick_recipe",
  "recipe_videos",
  "video_click",
]);
export type InteractionType = z.infer<typeof InteractionTypeSchema>;

export const MealInteractionRequestSchema = z.object({
  meal_name: z.string().min(1).max(200),
  meal_type: z.string().optional(),
  day: z.string().optional(),
  suggestion_id: z.string().uuid().optional().nullable(),
  interaction_type: InteractionTypeSchema,
  metadata: z.record(z.unknown()).optional(),
});
export type MealInteractionRequest = z.infer<typeof MealInteractionRequestSchema>;

// ─── Lookup constants ─────────────────────────────────────────────────────────

export const CUISINES = [
  { id: "north_indian", label: "North Indian", emoji: "🫓" },
  { id: "south_indian", label: "South Indian", emoji: "🍚" },
  { id: "west_indian", label: "West Indian", emoji: "🥘" },
  { id: "east_indian", label: "East Indian", emoji: "🐟" },
  { id: "street_food", label: "Street Food", emoji: "🌮" },
  { id: "pan_indian", label: "Pan-Indian", emoji: "🍛" },
] as const;

export const FUSION_DAYS = [
  { id: "monday", label: "Monday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
] as const;

export const HEALTH_GOALS = [
  { id: "weight_loss", label: "Weight Loss" },
  { id: "muscle_gain", label: "Muscle Gain" },
  { id: "heart_health", label: "Heart Health" },
  { id: "diabetic_friendly", label: "Diabetic Friendly" },
  { id: "gut_health", label: "Gut Health" },
  { id: "energy_boost", label: "Energy Boost" },
] as const;

export const DISLIKES = [
  "Onion",
  "Garlic",
  "Potato",
  "Tomato",
  "Capsicum",
  "Cauliflower",
  "Brinjal",
  "Bitter Gourd",
  "Okra (Bhindi)",
  "Coconut",
  "Mustard",
  "Peanuts",
  "Dairy",
  "Gluten",
  "Soy",
] as const;

export const MEAL_TIMES = [
  { id: "today", label: "Today's Meals", emoji: "🍽️", desc: "3–4 full-day suggestions" },
  { id: "breakfast", label: "Breakfast", emoji: "☀️", desc: "Morning meal ideas" },
  { id: "lunch", label: "Lunch", emoji: "🌤️", desc: "Midday meal ideas" },
  { id: "dinner", label: "Dinner", emoji: "🌙", desc: "Evening meal ideas" },
  { id: "week", label: "Full Week", emoji: "📅", desc: "14–21 meals, planned" },
  { id: "tiffin", label: "Tiffin / Lunchbox", emoji: "🥡", desc: "Packable, kid-friendly" },
] as const;

export const DIETARY_LABELS: Record<DietaryType, string> = {
  vegetarian: "Vegetarian",
  eggetarian: "Eggetarian",
  non_vegetarian: "Non-Vegetarian",
};
