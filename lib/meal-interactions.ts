import { supabase } from "@/lib/supabase";

export type InteractionType = "quick_recipe" | "recipe_videos" | "video_click";

export interface LogInteractionInput {
  household_id: string;
  suggestion_id?: string | null;
  meal_name: string;
  meal_type?: string;
  day?: string;
  interaction_type: InteractionType;
  metadata?: Record<string, unknown>;
}

export async function logMealInteraction(input: LogInteractionInput): Promise<void> {
  const { error } = await supabase.from("meal_interactions").insert({
    household_id: input.household_id,
    suggestion_id: input.suggestion_id ?? null,
    meal_name: input.meal_name,
    meal_type: input.meal_type ?? null,
    day: input.day ?? null,
    interaction_type: input.interaction_type,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Failed to log meal interaction:", error.message);
  }
}
