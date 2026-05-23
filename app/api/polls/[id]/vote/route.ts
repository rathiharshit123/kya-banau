import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildPollResponse } from "@/lib/poll-utils";
import { CastVoteRequestSchema } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CastVoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, title, tip, meals, status")
    .eq("id", id)
    .maybeSingle();

  if (pollError) {
    return NextResponse.json({ error: pollError.message }, { status: 500 });
  }
  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }
  if (poll.status !== "open") {
    return NextResponse.json({ error: "This poll is closed" }, { status: 409 });
  }

  const meals = poll.meals as unknown[];
  if (parsed.data.meal_index >= meals.length) {
    return NextResponse.json({ error: "Invalid meal option" }, { status: 422 });
  }

  const { error: voteError } = await supabase.from("poll_votes").insert({
    poll_id: id,
    meal_index: parsed.data.meal_index,
    voter_token: parsed.data.voter_token,
    voter_name: parsed.data.voter_name?.trim() || null,
  });

  if (voteError) {
    if (voteError.code === "23505") {
      return NextResponse.json({ error: "You already voted on this poll" }, { status: 409 });
    }
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  const { data: votes, error: votesError } = await supabase
    .from("poll_votes")
    .select("meal_index, voter_token, voter_name")
    .eq("poll_id", id);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  return NextResponse.json(
    buildPollResponse(poll, votes ?? [], parsed.data.voter_token),
  );
}
