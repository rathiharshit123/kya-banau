import { NextRequest, NextResponse } from "next/server";
import { logMealInteraction } from "@/lib/meal-interactions";
import { searchRecipeVideos, buildRecipeSearchQuery } from "@/lib/youtube";
import { RecipeVideosRequestSchema } from "@/lib/types";

function getHouseholdId(req: NextRequest): string | null {
  return req.headers.get("x-household-id");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RecipeVideosRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const householdId = getHouseholdId(req);

  try {
    const videos = await searchRecipeVideos(parsed.data.dish_name);
    const searchQuery = buildRecipeSearchQuery(parsed.data.dish_name);

    if (householdId) {
      await logMealInteraction({
        household_id: householdId,
        suggestion_id: parsed.data.suggestion_id,
        meal_name: parsed.data.dish_name,
        meal_type: parsed.data.meal_type,
        day: parsed.data.day,
        interaction_type: "recipe_videos",
        metadata: {
          search_query: searchQuery,
          videos_count: videos.length,
          video_ids: videos.map((v) => v.video_id),
        },
      });
    }

    return NextResponse.json({ videos, query: parsed.data.dish_name });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch recipe videos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
