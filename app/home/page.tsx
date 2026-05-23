"use client";

import React, { useState } from "react";
import Link from "next/link";
import { History, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealTypePicker } from "@/components/meal-type-picker";
import { MoodChips } from "@/components/mood-chips";
import { MealSuggestionCard } from "@/components/meal-suggestion-card";
import { SuggestionSkeleton } from "@/components/skeleton";
import { fetchSuggestions, logMeal } from "@/lib/api-client";
import { toast } from "@/lib/use-toast";
import type { MealType, Mood, SuggestionItem } from "@/lib/types";

export default function HomePage() {
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[] | null>(null);
  const [suggestionId, setSuggestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggest() {
    if (!mealType) {
      toast({ title: "Pick a meal type first!", variant: "error" });
      return;
    }
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await fetchSuggestions({ meal_type: mealType, moods });
      setSuggestions(result.suggestions);
      setSuggestionId(result.suggestion_id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast({ title: "Oops!", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePick(mealName: string) {
    if (!mealType) return;
    await logMeal({
      meal_name: mealName,
      meal_type: mealType,
      source: "suggested",
      suggestion_id: suggestionId ?? undefined,
    });
    toast({
      title: "Logged! 🍽️",
      description: `${mealName} added to your history.`,
      variant: "success",
    });
  }

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning! ☀️"
      : greetingHour < 17
      ? "Good afternoon! 🌤️"
      : "Good evening! 🌙";

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-terracotta flex items-center justify-center text-base shadow-sm shadow-terracotta/25">
            🍛
          </div>
          <span className="font-display text-lg font-bold text-charcoal">Kya Banau?</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/history"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-charcoal/60 hover:text-charcoal hover:bg-charcoal/8 transition-colors"
            title="History"
          >
            <History className="h-5 w-5" />
          </Link>
          <Link
            href="/preferences"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-charcoal/60 hover:text-charcoal hover:bg-charcoal/8 transition-colors"
            title="Preferences"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="flex-1 px-5 py-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Hero */}
        <div className="space-y-1">
          <p className="text-sm text-charcoal/50">{greeting}</p>
          <h1 className="font-display text-4xl font-bold text-charcoal leading-tight">
            Aaj kya{" "}
            <span className="text-terracotta italic">banau?</span>
          </h1>
        </div>

        {/* Meal type */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">
            Which meal?
          </h2>
          <MealTypePicker value={mealType} onChange={setMealType} />
        </section>

        {/* Mood */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">
            What's the mood today?
          </h2>
          <MoodChips value={moods} onChange={setMoods} />
          <p className="text-xs text-charcoal/40">Optional — pick any that apply</p>
        </section>

        {/* Suggest button */}
        <Button
          size="lg"
          onClick={handleSuggest}
          disabled={loading || !mealType}
          className="w-full shadow-lg shadow-terracotta/25"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-cream border-t-transparent animate-spin" />
              Finding ideas...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Suggest dishes
            </span>
          )}
        </Button>

        {/* Results */}
        {loading && <SuggestionSkeleton />}

        {!loading && error && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <strong>Something went wrong:</strong> {error}
          </div>
        )}

        {!loading && suggestions && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">
              {suggestions.length} ideas for you
            </h2>
            {suggestions.map((s, i) => (
              <MealSuggestionCard
                key={s.name}
                suggestion={s}
                index={i}
                onPick={handlePick}
              />
            ))}
            <button
              type="button"
              onClick={handleSuggest}
              className="w-full text-sm text-charcoal/50 hover:text-terracotta transition-colors py-2"
            >
              ↺ Get different suggestions
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
