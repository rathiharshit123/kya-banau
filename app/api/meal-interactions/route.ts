import { NextRequest, NextResponse } from "next/server";
import { logMealInteraction } from "@/lib/meal-interactions";
import { MealInteractionRequestSchema } from "@/lib/types";

function getHouseholdId(req: NextRequest): string | null {
  return req.headers.get("x-household-id");
}

export async function POST(req: NextRequest) {
  const householdId = getHouseholdId(req);
  if (!householdId) {
    return NextResponse.json({ error: "Missing x-household-id header" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = MealInteractionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  await logMealInteraction({
    household_id: householdId,
    suggestion_id: parsed.data.suggestion_id,
    meal_name: parsed.data.meal_name,
    meal_type: parsed.data.meal_type,
    day: parsed.data.day,
    interaction_type: parsed.data.interaction_type,
    metadata: parsed.data.metadata,
  });

  return NextResponse.json({ ok: true });
}
