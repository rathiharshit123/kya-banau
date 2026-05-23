import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildPollResponse } from "@/lib/poll-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const voterToken = req.nextUrl.searchParams.get("voter_token");

  const { data: poll, error } = await supabase
    .from("polls")
    .select("id, title, tip, meals, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const { data: votes, error: votesError } = await supabase
    .from("poll_votes")
    .select("meal_index, voter_token, voter_name")
    .eq("poll_id", id);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  return NextResponse.json(buildPollResponse(poll, votes ?? [], voterToken));
}
