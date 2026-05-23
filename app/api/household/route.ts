import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { HouseholdUpsertSchema } from "@/lib/types";

function getHouseholdId(req: NextRequest): string | null {
  return req.headers.get("x-household-id");
}

export async function GET(req: NextRequest) {
  const householdId = getHouseholdId(req);
  if (!householdId) {
    return NextResponse.json({ error: "Missing x-household-id header" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("households")
    .select("*")
    .eq("id", householdId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  return NextResponse.json(data);
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
    body = {};
  }

  const parsed = HouseholdUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("households")
    .upsert(
      { id: householdId, ...parsed.data },
      { onConflict: "id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
