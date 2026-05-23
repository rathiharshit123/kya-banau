import type { NextRequest } from "next/server";
import type { Meal, PollOption, PollResponse } from "@/lib/types";

type PollRow = {
  id: string;
  title: string;
  tip: string | null;
  meals: Meal[];
  status: "open" | "closed";
};

type VoteRow = {
  meal_index: number;
  voter_token: string;
  voter_name: string | null;
};

export function getBaseUrl(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildPollShareUrl(baseUrl: string, pollId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/poll/${pollId}`;
}

export function buildPollResponse(
  poll: PollRow,
  votes: VoteRow[],
  voterToken?: string | null,
  shareUrl?: string,
): PollResponse {
  const meals = poll.meals;
  const voteCounts = new Map<number, number>();

  for (const vote of votes) {
    voteCounts.set(vote.meal_index, (voteCounts.get(vote.meal_index) ?? 0) + 1);
  }

  const options: PollOption[] = meals.map((meal, meal_index) => ({
    meal_index,
    name: meal.name,
    meal_type: meal.meal_type,
    day: meal.day,
    description: meal.description,
    votes: voteCounts.get(meal_index) ?? 0,
  }));

  const myVote = voterToken
    ? votes.find((vote) => vote.voter_token === voterToken) ?? null
    : null;

  return {
    id: poll.id,
    title: poll.title,
    tip: poll.tip,
    status: poll.status,
    total_votes: votes.length,
    options,
    my_vote: myVote
      ? { meal_index: myVote.meal_index, voter_name: myVote.voter_name }
      : null,
    share_url: shareUrl,
  };
}
