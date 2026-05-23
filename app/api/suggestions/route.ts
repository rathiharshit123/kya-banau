import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { buildSuggestPrompt, MEAL_PLAN_SCHEMA } from "@/lib/prompts";
import { SuggestRequestSchema, MealPlanSchema } from "@/lib/types";

const DAILY_RATE_LIMIT = 20;

function getHouseholdId(req: NextRequest): string | null {
  return req.headers.get("x-household-id");
}

async function checkRateLimit(householdId: string): Promise<boolean> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("suggestions")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId)
    .gte("created_at", since.toISOString());

  return (count ?? 0) < DAILY_RATE_LIMIT;
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

  const parsed = SuggestRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const withinLimit = await checkRateLimit(householdId);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Daily suggestion limit reached. Try again tomorrow!" },
      { status: 429 }
    );
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("*")
    .eq("id", householdId)
    .maybeSingle();

  if (householdError || !household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  const { system, user } = buildSuggestPrompt(household, parsed.data.meal_time);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    max_tokens: 4000,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_plan",
        strict: true,
        schema: MEAL_PLAN_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    return NextResponse.json({ error: "OpenAI returned empty response" }, { status: 500 });
  }

  let parsed_json: unknown;
  try {
    parsed_json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const validated = MealPlanSchema.safeParse(parsed_json);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid AI response shape" }, { status: 500 });
  }

  const { data: suggestionLog } = await supabase
    .from("suggestions")
    .insert({
      household_id: householdId,
      meal_time: parsed.data.meal_time,
      payload: validated.data,
    })
    .select("id")
    .single();

  return NextResponse.json({
    greeting: validated.data.greeting,
    tip: validated.data.tip,
    meals: validated.data.meals,
    suggestion_id: suggestionLog?.id ?? null,
  });
}
