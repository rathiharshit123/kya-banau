import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MealLogSchema } from "@/lib/types";

function getHouseholdId(req: NextRequest): string | null {
  return req.headers.get("x-household-id");
}

export async function GET(req: NextRequest) {
  const householdId = getHouseholdId(req);
  if (!householdId) {
    return NextResponse.json({ error: "Missing x-household-id header" }, { status: 400 });
  }

  const daysParam = req.nextUrl.searchParams.get("days") ?? "14";
  const days = Math.min(parseInt(daysParam, 10) || 14, 60);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("meal_history")
    .select("*")
    .eq("household_id", householdId)
    .gte("eaten_at", since)
    .order("eaten_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
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

  const parsed = MealLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { suggestion_id, ...mealData } = parsed.data;

  const { data, error } = await supabase
    .from("meal_history")
    .insert({ household_id: householdId, ...mealData })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If from a suggestion, mark chosen meal
  if (suggestion_id) {
    await supabase
      .from("suggestions")
      .update({ chosen_meal: parsed.data.meal_name })
      .eq("id", suggestion_id)
      .eq("household_id", householdId);
  }

  return NextResponse.json(data, { status: 201 });
}
