"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchMealHistory, logMeal } from "@/lib/api-client";
import { toast } from "@/lib/use-toast";
import {
  MEAL_TYPE_EMOJI,
  MEAL_TYPE_LABELS,
  type MealHistoryItem,
  type MealType,
} from "@/lib/types";

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function groupByDate(meals: MealHistoryItem[]): Map<string, MealHistoryItem[]> {
  const map = new Map<string, MealHistoryItem[]>();
  for (const meal of meals) {
    const key = formatRelativeDate(meal.eaten_at);
    const group = map.get(key) ?? [];
    group.push(meal);
    map.set(key, group);
  }
  return map;
}

export default function HistoryPage() {
  const [meals, setMeals] = useState<MealHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMealName, setFormMealName] = useState("");
  const [formMealType, setFormMealType] = useState<MealType>("lunch");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMealHistory(14);
      setMeals(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleLog() {
    if (!formMealName.trim()) {
      toast({ title: "Enter a meal name", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      await logMeal({ meal_name: formMealName.trim(), meal_type: formMealType, source: "manual" });
      toast({ title: "Logged! 🍽️", variant: "success" });
      setFormMealName("");
      setShowForm(false);
      load();
    } catch (e) {
      toast({ title: "Failed to log", description: String(e), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const grouped = groupByDate(meals);

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Link
          href="/home"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-charcoal/60 hover:text-charcoal hover:bg-charcoal/8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-charcoal">Meal History</h1>
      </header>

      <div className="flex-1 px-5 pb-8 space-y-5 max-w-lg mx-auto w-full">
        {/* Log a meal button */}
        <Button
          variant="outline"
          onClick={() => setShowForm((p) => !p)}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Log a meal I ate"}
        </Button>

        {showForm && (
          <div className="rounded-2xl border-2 border-charcoal/10 bg-cream/80 p-5 space-y-4 fade-up">
            <h3 className="font-semibold text-charcoal">Log a meal</h3>
            <div className="space-y-1.5">
              <Label htmlFor="meal-name">Meal name</Label>
              <Input
                id="meal-name"
                placeholder="e.g. Aloo Paratha"
                value={formMealName}
                onChange={(e) => setFormMealName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLog()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Meal type</Label>
              <Select
                value={formMealType}
                onValueChange={(v) => setFormMealType(v as MealType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {MEAL_TYPE_EMOJI[v]} {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLog} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save meal"}
            </Button>
          </div>
        )}

        {/* History list */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-charcoal/8 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && meals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <UtensilsCrossed className="h-12 w-12 text-charcoal/20" />
            <p className="text-charcoal/50 text-sm">No meals logged in the last 14 days.</p>
            <p className="text-charcoal/40 text-xs">
              Get suggestions and tap "I'll make this!" — or log meals manually above.
            </p>
          </div>
        )}

        {!loading && meals.length > 0 &&
          Array.from(grouped.entries()).map(([dateLabel, group]) => (
            <section key={dateLabel} className="space-y-2">
              <h2 className="text-xs font-semibold text-charcoal/40 uppercase tracking-wide">
                {dateLabel}
              </h2>
              {group.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-charcoal/8 bg-cream/80 px-4 py-3"
                >
                  <span className="text-xl">
                    {MEAL_TYPE_EMOJI[meal.meal_type as MealType] ?? "🍽️"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{meal.meal_name}</p>
                    <p className="text-xs text-charcoal/40">
                      {MEAL_TYPE_LABELS[meal.meal_type as MealType]} ·{" "}
                      {meal.source === "suggested" ? "AI suggested" : "Manual log"}
                    </p>
                  </div>
                  {meal.rating && (
                    <span className="text-xs font-medium text-saffron">
                      {"★".repeat(meal.rating)}
                    </span>
                  )}
                </div>
              ))}
            </section>
          ))}
      </div>
    </main>
  );
}
