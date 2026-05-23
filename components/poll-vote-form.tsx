"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { castPollVote, fetchPoll } from "@/lib/api-client";
import { getOrCreateVoterToken } from "@/lib/poll-token";
import { toast } from "@/lib/use-toast";
import type { PollResponse } from "@/lib/types";

interface PollVoteFormProps {
  pollId: string;
}

export function PollVoteForm({ pollId }: PollVoteFormProps) {
  const [poll, setPoll] = useState<PollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [voterName, setVoterName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadPoll() {
    setLoading(true);
    setError(null);
    try {
      const voterToken = getOrCreateVoterToken();
      const data = await fetchPoll(pollId, voterToken);
      setPoll(data);
      setSelectedIndex(data.my_vote?.meal_index ?? null);
      if (data.my_vote?.voter_name) {
        setVoterName(data.my_vote.voter_name);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPoll();
  }, [pollId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIndex === null || !poll || poll.status !== "open") return;

    setSubmitting(true);
    try {
      const voterToken = getOrCreateVoterToken();
      const updated = await castPollVote(pollId, {
        meal_index: selectedIndex,
        voter_token: voterToken,
        voter_name: voterName.trim() || undefined,
      });
      setPoll(updated);
      toast({ title: "Vote submitted!", variant: "success" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Could not submit vote", description: msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-4xl pulse">🗳️</div>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Loading poll…
        </p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div
        className="rounded-2xl px-5 py-4 text-sm"
        style={{
          background: "color-mix(in srgb, #f87171 10%, var(--color-card))",
          border: "1px solid color-mix(in srgb, #f87171 30%, var(--color-border))",
          color: "#f87171",
        }}
      >
        {error ?? "Poll not found"}
      </div>
    );
  }

  const maxVotes = Math.max(...poll.options.map((option) => option.votes), 0);
  const hasVoted = poll.my_vote !== null;
  const showResults = hasVoted || poll.status === "closed";
  const leadingIndexes = poll.options
    .filter((option) => option.votes === maxVotes && maxVotes > 0)
    .map((option) => option.meal_index);

  return (
    <div className="space-y-5 step-enter">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          <BarChart3 className="h-3.5 w-3.5" />
          Family poll
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>
          {poll.title}
        </h1>
        {poll.tip && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {poll.tip}
          </p>
        )}
      </div>

      {hasVoted && (
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, #25D366 10%, var(--color-card))",
            border: "1px solid color-mix(in srgb, #25D366 30%, var(--color-border))",
            color: "var(--color-text)",
          }}
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: "#25D366" }} />
          <span>
            Thanks for voting
            {poll.my_vote?.voter_name ? `, ${poll.my_vote.voter_name}` : ""}! Results update as others vote.
          </span>
        </div>
      )}

      {showResults ? (
        <div className="space-y-3">
          {poll.options.map((option) => {
            const pct = poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0;
            const isMine = poll.my_vote?.meal_index === option.meal_index;
            const isLeading = leadingIndexes.includes(option.meal_index);

            return (
              <div
                key={option.meal_index}
                className="card"
                style={{
                  borderColor: isMine
                    ? "color-mix(in srgb, var(--color-accent) 50%, var(--color-border))"
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-accent)" }}>
                      {option.meal_type} · {option.day}
                    </p>
                    <h2 className="font-display text-lg font-bold" style={{ color: "var(--color-text)" }}>
                      {option.name}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                      {option.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                      {option.votes}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {pct}%
                    </p>
                  </div>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "color-mix(in srgb, var(--color-border) 80%, transparent)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isLeading ? "var(--color-accent)" : "color-mix(in srgb, var(--color-muted) 60%, transparent)",
                    }}
                  />
                </div>
                {isMine && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: "var(--color-accent)" }}>
                    Your vote
                  </p>
                )}
              </div>
            );
          })}

          <p className="text-center text-sm" style={{ color: "var(--color-muted)" }}>
            {poll.total_votes} vote{poll.total_votes === 1 ? "" : "s"} so far
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {poll.options.map((option) => (
              <button
                key={option.meal_index}
                type="button"
                onClick={() => setSelectedIndex(option.meal_index)}
                className={`radio-card w-full text-left${selectedIndex === option.meal_index ? " active" : ""}`}
              >
                <span className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
                  {option.meal_type} · {option.day}
                </span>
                <span className="font-display text-lg font-bold" style={{ color: "var(--color-text)" }}>
                  {option.name}
                </span>
                <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="voter-name" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              Your name (optional)
            </label>
            <input
              id="voter-name"
              type="text"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Mom, Dad, Harshit…"
              maxLength={50}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: "var(--color-card)",
                border: "1.5px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={selectedIndex === null || submitting}
            className="btn-main w-full"
          >
            {submitting ? "Submitting…" : "Submit vote"}
          </button>
        </form>
      )}

      <div className="text-center pb-4">
        <Link href="/home" className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
          Create your own meal plan →
        </Link>
      </div>
    </div>
  );
}
