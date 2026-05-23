import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { buildSuggestPrompt, SUGGESTION_SCHEMA } from "@/lib/prompts";
import { SuggestRequestSchema, SuggestionItemSchema } from "@/lib/types";
import { z } from "zod";

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

  // Rate limit check
  const withinLimit = await checkRateLimit(householdId);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Daily suggestion limit reached. Try again tomorrow!" },
      { status: 429 }
    );
  }

  // Load household
  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("*")
    .eq("id", householdId)
    .maybeSingle();

  if (householdError || !household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  // Load 14-day meal history
  const since14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: history } = await supabase
    .from("meal_history")
    .select("*")
    .eq("household_id", householdId)
    .gte("eaten_at", since14Days)
    .order("eaten_at", { ascending: false });

  const { system, user } = buildSuggestPrompt(
    household,
    history ?? [],
    parsed.data.meal_type,
    parsed.data.moods
  );

  // Call OpenAI with Structured Outputs
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_suggestions",
        strict: true,
        schema: SUGGESTION_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    return NextResponse.json({ error: "OpenAI returned empty response" }, { status: 500 });
  }

  let suggestions: unknown;
  try {
    suggestions = JSON.parse(raw).suggestions;
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const validatedSuggestions = z.array(SuggestionItemSchema).safeParse(suggestions);
  if (!validatedSuggestions.success) {
    return NextResponse.json({ error: "Invalid AI response shape" }, { status: 500 });
  }

  // Log to suggestions table
  const { data: suggestionLog } = await supabase
    .from("suggestions")
    .insert({
      household_id: householdId,
      meal_type: parsed.data.meal_type,
      moods: parsed.data.moods,
      payload: validatedSuggestions.data,
    })
    .select("id")
    .single();

  return NextResponse.json({
    suggestions: validatedSuggestions.data,
    suggestion_id: suggestionLog?.id ?? null,
  });
}
