"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
import { ChipInput } from "@/components/chip-input";
import { SpiceSlider } from "@/components/spice-slider";
import { fetchHousehold, upsertHousehold } from "@/lib/api-client";
import { toast } from "@/lib/use-toast";
import {
  DIETARY_LABELS,
  CUISINE_LABELS,
  type DietaryType,
  type RegionalCuisine,
  type Household,
} from "@/lib/types";

export default function PreferencesPage() {
  const [household, setHousehold] = useState<Partial<Household>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHousehold()
      .then((h) => setHousehold(h))
      .catch(() => {/* not yet created */})
      .finally(() => setLoading(false));
  }, []);

  function patch<K extends keyof Household>(key: K, value: Household[K]) {
    setHousehold((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertHousehold({
        name: household.name ?? undefined,
        dietary_type: household.dietary_type,
        regional_cuisine: household.regional_cuisine,
        spice_level: household.spice_level,
        family_size: household.family_size,
        loved_dishes: household.loved_dishes,
        disliked_dishes: household.disliked_dishes,
        disliked_ingredients: household.disliked_ingredients,
        notes: household.notes,
      });
      toast({ title: "Preferences saved!", variant: "success" });
    } catch (e) {
      toast({ title: "Failed to save", description: String(e), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Link
          href="/home"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-charcoal/60 hover:text-charcoal hover:bg-charcoal/8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-charcoal">Preferences</h1>
      </header>

      <div className="flex-1 px-5 pb-10 space-y-6 max-w-lg mx-auto w-full">
        {/* Basics */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-charcoal/50 uppercase tracking-wide">
            Family basics
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Family name</Label>
            <Input
              id="name"
              placeholder="e.g. The Sharmas"
              value={household.name ?? ""}
              onChange={(e) => patch("name", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Dietary preference</Label>
            <Select
              value={household.dietary_type ?? "vegetarian"}
              onValueChange={(v) => patch("dietary_type", v as DietaryType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIETARY_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Regional cuisine</Label>
            <Select
              value={household.regional_cuisine ?? "north_indian"}
              onValueChange={(v) => patch("regional_cuisine", v as RegionalCuisine)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CUISINE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fam-size">Family size</Label>
            <Input
              id="fam-size"
              type="number"
              min={1}
              max={20}
              value={household.family_size ?? 2}
              onChange={(e) => patch("family_size", parseInt(e.target.value) || 2)}
              className="max-w-[120px]"
            />
          </div>

          <SpiceSlider
            value={household.spice_level ?? 3}
            onChange={(v) => patch("spice_level", v)}
          />
        </section>

        {/* Taste preferences */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-charcoal/50 uppercase tracking-wide">
            Taste preferences
          </h2>

          <div className="space-y-1.5">
            <Label>Dishes you love ❤️</Label>
            <ChipInput
              value={household.loved_dishes ?? []}
              onChange={(v) => patch("loved_dishes", v)}
              placeholder="e.g. Dal Makhani..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Dishes to avoid 🚫</Label>
            <ChipInput
              value={household.disliked_dishes ?? []}
              onChange={(v) => patch("disliked_dishes", v)}
              placeholder="e.g. Karela, Bhindi..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ingredients to avoid</Label>
            <ChipInput
              value={household.disliked_ingredients ?? []}
              onChange={(v) => patch("disliked_ingredients", v)}
              placeholder="e.g. Garlic, Coconut..."
            />
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal/50 uppercase tracking-wide">
            Additional notes
          </h2>
          <textarea
            value={household.notes ?? ""}
            onChange={(e) => patch("notes", e.target.value)}
            placeholder="Allergies, health conditions, anything else the AI should know..."
            rows={3}
            className="flex w-full rounded-xl border-2 border-charcoal/20 bg-cream/60 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus-visible:outline-none focus-visible:border-terracotta focus-visible:bg-cream transition-colors resize-none"
          />
        </section>

        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="w-full shadow-lg shadow-terracotta/25"
        >
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </main>
  );
}
