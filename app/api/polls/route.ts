import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildPollShareUrl, buildPollResponse, getBaseUrl } from "@/lib/poll-utils";
import { CreatePollRequestSchema } from "@/lib/types";

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

  const parsed = CreatePollRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { data: poll, error } = await supabase
    .from("polls")
    .insert({
      household_id: householdId,
      suggestion_id: parsed.data.suggestion_id ?? null,
      title: parsed.data.title,
      tip: parsed.data.tip ?? null,
      meals: parsed.data.meals,
      status: "open",
    })
    .select("id, title, tip, meals, status")
    .single();

  if (error || !poll) {
    return NextResponse.json({ error: error?.message ?? "Failed to create poll" }, { status: 500 });
  }

  const shareUrl = buildPollShareUrl(getBaseUrl(req), poll.id);
  const response = buildPollResponse(poll, [], null, shareUrl);

  return NextResponse.json(response, { status: 201 });
}
