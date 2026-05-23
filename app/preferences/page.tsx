"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchHousehold, upsertHousehold } from "@/lib/api-client";
import { toast } from "@/lib/use-toast";
import {
  FUSION_DAYS,
  HEALTH_GOALS,
  DISLIKES,
  DIETARY_LABELS,
  type DietaryType,
  type Household,
} from "@/lib/types";
import { CuisinePicker } from "@/components/cuisine-picker";

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function Chip({
  label,
  active,
  onClick,
  emoji,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  emoji?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`chip${active ? " active" : ""}`}>
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest"
      style={{ color: "var(--color-muted)" }}
    >
      {children}
    </h2>
  );
}

export default function PreferencesPage() {
  const [household, setHousehold] = useState<Partial<Household>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHousehold()
      .then((h) => setHousehold(h))
      .catch(() => {})
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
        include_fish: household.include_fish,
        has_kids: household.has_kids,
        cuisines: household.cuisines,
        fusion_days: household.fusion_days,
        height_cm: household.height_cm,
        weight_kg: household.weight_kg,
        health_goal: household.health_goal,
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
      <main
        className="min-h-dvh flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div
          className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
      </main>
    );
  }

  const cuisines = household.cuisines ?? [];
  const fusionDays = household.fusion_days ?? [];
  const dislikes = household.disliked_ingredients ?? [];

  return (
    <main className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg)" }}>
      <header
        className="flex items-center gap-3 px-5 pt-6 pb-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <Link
          href="/home"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{ color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Preferences
        </h1>
      </header>

      <div className="flex-1 px-5 pb-10 space-y-8 max-w-lg mx-auto w-full pt-5">
        {/* Family name */}
        <section className="space-y-3">
          <SectionLabel>Family name</SectionLabel>
          <input
            type="text"
            placeholder="e.g. The Sharmas"
            value={household.name ?? ""}
            onChange={(e) => patch("name", e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: "var(--color-card)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </section>

        {/* Cuisines */}
        <section className="space-y-3">
          <SectionLabel>Preferred Cuisines</SectionLabel>
          <CuisinePicker
            value={cuisines}
            onChange={(next) => patch("cuisines", next as Household["cuisines"])}
          />
        </section>

        {/* Fusion days */}
        <section className="space-y-3">
          <SectionLabel>Fusion Days</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {FUSION_DAYS.map((d) => (
              <Chip
                key={d.id}
                label={d.label}
                active={fusionDays.includes(d.id)}
                onClick={() =>
                  patch("fusion_days", toggle(fusionDays, d.id) as Household["fusion_days"])
                }
              />
            ))}
          </div>
        </section>

        {/* Diet */}
        <section className="space-y-3">
          <SectionLabel>Dietary Preference</SectionLabel>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(DIETARY_LABELS) as DietaryType[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => patch("dietary_type", d)}
                className={`radio-card text-left${household.dietary_type === d ? " active" : ""}`}
              >
                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      household.dietary_type === d
                        ? "var(--color-accent)"
                        : "var(--color-text)",
                  }}
                >
                  {DIETARY_LABELS[d]}
                </span>
              </button>
            ))}
          </div>

          {household.dietary_type === "non_vegetarian" && (
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={household.include_fish ?? false}
                onChange={(e) => patch("include_fish", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                Include fish &amp; seafood
              </span>
            </label>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={household.has_kids ?? false}
              onChange={(e) => patch("has_kids", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm" style={{ color: "var(--color-text)" }}>
              Include kid-friendly meal suggestions
            </span>
          </label>
        </section>

        {/* Health */}
        <section className="space-y-3">
          <SectionLabel>Body &amp; Health Goal</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                Height (cm)
              </label>
              <input
                type="number"
                placeholder="e.g. 170"
                value={household.height_cm ?? ""}
                onChange={(e) =>
                  patch("height_cm", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: "var(--color-card)",
                  border: "1.5px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="e.g. 65"
                value={household.weight_kg ?? ""}
                onChange={(e) =>
                  patch("weight_kg", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: "var(--color-card)",
                  border: "1.5px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {HEALTH_GOALS.map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                active={household.health_goal === g.id}
                onClick={() =>
                  patch("health_goal", household.health_goal === g.id ? "" : g.id)
                }
              />
            ))}
          </div>
        </section>

        {/* Dislikes */}
        <section className="space-y-3">
          <SectionLabel>Ingredients to Avoid</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DISLIKES.map((d) => (
              <Chip
                key={d}
                label={d}
                active={dislikes.includes(d)}
                onClick={() =>
                  patch(
                    "disliked_ingredients",
                    toggle(dislikes, d) as Household["disliked_ingredients"]
                  )
                }
              />
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-3">
          <SectionLabel>Additional Notes</SectionLabel>
          <textarea
            value={household.notes ?? ""}
            onChange={(e) => patch("notes", e.target.value)}
            placeholder="Allergies, health conditions, anything else the AI should know..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors"
            style={{
              background: "var(--color-card)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-main w-full"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </main>
  );
}
