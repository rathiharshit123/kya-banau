"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Sparkles, RefreshCw } from "lucide-react";
import { MealTimePicker } from "@/components/meal-time-picker";
import { MealCard } from "@/components/meal-card";
import { GreetingCard } from "@/components/greeting-card";
import { ResultsFilter, filterMeals, type FilterId } from "@/components/results-filter";
import { SuggestionSkeleton } from "@/components/skeleton";
import { fetchHousehold, fetchSuggestions, createPoll } from "@/lib/api-client";
import { buildFamilyGroupShareMessage, getShareTitle, openWhatsAppShare } from "@/lib/share-message";
import { toast } from "@/lib/use-toast";
import { isPollEligibleMealTime, type MealTime, type Meal } from "@/lib/types";

export default function HomePage() {
  const [mealTime, setMealTime] = useState<MealTime | null>(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [error, setError] = useState<string | null>(null);
  const [suggestionId, setSuggestionId] = useState<string | null>(null);
  const [pollId, setPollId] = useState<string | null>(null);
  const [pollUrl, setPollUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [generatedMealTime, setGeneratedMealTime] = useState<MealTime | null>(null);
  const [familyName, setFamilyName] = useState<string | null>(null);

  useEffect(() => {
    fetchHousehold()
      .then((h) => {
        const name = h.name?.trim();
        if (name) setFamilyName(name);
      })
      .catch(() => {});
  }, []);

  const pollEnabled = isPollEligibleMealTime(generatedMealTime);

  async function handleGenerate() {
    if (!mealTime) {
      toast({ title: "Pick a meal time first!", variant: "error" });
      return;
    }
    setLoading(true);
    setError(null);
    setMeals(null);
    setGreeting(null);
    setTip(null);
    setFilter("all");
    setSuggestionId(null);
    setPollId(null);
    setPollUrl(null);
    setGeneratedMealTime(null);

    try {
      const [result, household] = await Promise.all([
        fetchSuggestions({ meal_time: mealTime }),
        fetchHousehold().catch(() => null),
      ]);
      const name = household?.name?.trim();
      if (name) setFamilyName(name);
      setGreeting(result.greeting);
      setTip(result.tip);
      setMeals(result.meals);
      setSuggestionId(result.suggestion_id ?? null);
      setGeneratedMealTime(mealTime);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast({ title: "Oops!", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function ensurePoll() {
    if (!pollEnabled) {
      return { pollId: null, pollUrl: null };
    }
    if (pollId && pollUrl) {
      return { pollId, pollUrl };
    }
    if (!meals) {
      throw new Error("No meals to share");
    }

    const visible = filterMeals(meals, filter, generatedMealTime);
    const poll = await createPoll({
      suggestion_id: suggestionId,
      title: getShareTitle(visible, filter),
      tip,
      meals: visible,
    });

    const url = poll.share_url ?? `${window.location.origin}/poll/${poll.id}`;
    setPollId(poll.id);
    setPollUrl(url);
    return { pollId: poll.id, pollUrl: url };
  }

  function getShareMessage(url?: string | null) {
    if (!meals) return "";
    const visible = filterMeals(meals, filter, generatedMealTime);
    const pollUrlForMessage = pollEnabled ? (url ?? pollUrl) : null;
    return buildFamilyGroupShareMessage(visible, {
      tip,
      filter,
      pollUrl: pollUrlForMessage,
    });
  }

  async function handleWhatsAppShare() {
    setSharing(true);
    try {
      const { pollUrl: url } = await ensurePoll();
      const message = getShareMessage(url);
      if (!message) return;
      openWhatsAppShare(message);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: pollEnabled ? "Could not create poll" : "Could not share",
        description: msg,
        variant: "error",
      });
    } finally {
      setSharing(false);
    }
  }

  async function handleCopyShare() {
    setSharing(true);
    try {
      const { pollUrl: url } = await ensurePoll();
      const message = getShareMessage(url);
      if (!message) return;
      await navigator.clipboard.writeText(message);
      toast({
        title: pollEnabled ? "Copied with vote link!" : "Copied for family group!",
        variant: "success",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: "Could not copy", description: msg, variant: "error" });
    } finally {
      setSharing(false);
    }
  }

  const visibleMeals = meals
    ? filterMeals(meals, filter, generatedMealTime)
    : null;

  const greetingHour = new Date().getHours();
  const timeGreeting =
    greetingHour < 12 ? "Good morning ☀️" : greetingHour < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";

  return (
    <main className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pt-6 pb-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center text-base"
            style={{ background: "color-mix(in srgb, var(--color-accent) 20%, var(--color-card))", border: "1px solid var(--color-border)" }}
          >
            🍛
          </div>
          <span className="font-display text-lg font-bold" style={{ color: "var(--color-text)" }}>
            Kya Banau?
          </span>
        </div>
        <Link
          href="/preferences"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 h-9 text-sm font-medium transition-colors hover:text-[var(--color-text)]"
          style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Preferences
        </Link>
      </header>

      <div className="flex-1 px-5 py-5 space-y-6 max-w-lg mx-auto w-full">
        {/* Hero */}
        {!meals && !loading && (
          <div className="space-y-1 step-enter">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{timeGreeting}</p>
            <h1 className="font-display text-4xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>
              Aaj kya{" "}
              <span style={{ color: "var(--color-accent)" }} className="italic">
                banau?
              </span>
            </h1>
          </div>
        )}

        {/* Meal time picker */}
        {!meals && !loading && (
          <section className="space-y-3 step-enter">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              What are you planning?
            </h2>
            <MealTimePicker value={mealTime} onChange={setMealTime} />
          </section>
        )}

        {/* Generate button */}
        {!meals && !loading && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!mealTime}
            className="btn-main w-full step-enter"
          >
            <Sparkles className="h-4 w-4" />
            Generate meal plan
          </button>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <div className="text-center space-y-2 py-4">
              <div className="text-4xl pulse">🍳</div>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Crafting your personalised meal plan…
              </p>
            </div>
            <SuggestionSkeleton />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="rounded-2xl px-5 py-4 text-sm"
            style={{ background: "color-mix(in srgb, #f87171 10%, var(--color-card))", border: "1px solid color-mix(in srgb, #f87171 30%, var(--color-border))", color: "#f87171" }}
          >
            <strong>Something went wrong:</strong> {error}
          </div>
        )}

        {/* Results */}
        {!loading && meals && greeting && tip && (
          <div className="space-y-4 step-enter">
            {familyName && (
              <p className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                Meal plan for{" "}
                <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
                  {familyName}
                </span>
              </p>
            )}
            <GreetingCard greeting={greeting} tip={tip} />

            <ResultsFilter
              meals={meals}
              mealTime={generatedMealTime}
              active={filter}
              onChange={(next) => {
                setFilter(next);
                if (pollEnabled) {
                  setPollId(null);
                  setPollUrl(null);
                }
              }}
              onWhatsAppShare={handleWhatsAppShare}
              onCopyShare={handleCopyShare}
              sharing={sharing}
            />

            {pollEnabled && pollUrl && (
              <Link
                href={`/poll/${pollId}`}
                className="block text-center text-sm font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                View live poll results →
              </Link>
            )}

            <div className="space-y-3">
              {(visibleMeals ?? []).map((meal, i) => (
                <MealCard
                  key={`${meal.day}-${meal.meal_type}-${meal.name}`}
                  meal={meal}
                  index={i}
                  suggestionId={suggestionId}
                />
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 pb-6">
              <button
                type="button"
                onClick={() => {
                  setMeals(null);
                  setGreeting(null);
                  setTip(null);
                  setFilter("all");
                  setSuggestionId(null);
                  setPollId(null);
                  setPollUrl(null);
                  setGeneratedMealTime(null);
                }}
                className="btn-ghost flex-1"
              >
                Change scope
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="btn-ghost flex-1 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
