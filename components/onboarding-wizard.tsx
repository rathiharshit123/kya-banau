"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertHousehold } from "@/lib/api-client";
import { toast } from "@/lib/use-toast";
import {
  FUSION_DAYS,
  HEALTH_GOALS,
  DISLIKES,
  DIETARY_LABELS,
  type DietaryType,
} from "@/lib/types";
import { CuisinePicker } from "@/components/cuisine-picker";
import { ProteinGoalCard } from "@/components/protein-goal-card";

interface FormState {
  name: string;
  dietary_type: DietaryType;
  include_fish: boolean;
  has_kids: boolean;
  cuisines: string[];
  fusion_days: string[];
  height_cm: string;
  weight_kg: string;
  health_goal: string;
  disliked_ingredients: string[];
  notes: string;
}

const INITIAL: FormState = {
  name: "",
  dietary_type: "vegetarian",
  include_fish: false,
  has_kids: false,
  cuisines: [],
  fusion_days: [],
  height_cm: "",
  weight_kg: "",
  health_goal: "",
  disliked_ingredients: [],
  notes: "",
};

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function calcBmi(h: string, w: string): string | null {
  const hNum = parseFloat(h);
  const wNum = parseFloat(w);
  if (!hNum || !wNum || hNum < 50 || wNum < 10) return null;
  const hM = hNum / 100;
  return (wNum / (hM * hM)).toFixed(1);
}

function bmiLabel(bmi: string): string {
  const v = parseFloat(bmi);
  if (v < 18.5) return "Underweight";
  if (v < 25) return "Healthy";
  if (v < 30) return "Overweight";
  return "Obese";
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function Progress({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / (total + 1)) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: "var(--color-muted)" }}>
        <span>Step {step + 1} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1 w-full rounded-full" style={{ background: "var(--color-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--color-accent)" }}
        />
      </div>
    </div>
  );
}

// ─── Chip ──────────────────────────────────────────────────────────────────────
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
    <button
      type="button"
      onClick={onClick}
      className={`chip${active ? " active" : ""}`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}

// ─── Main wizard ───────────────────────────────────────────────────────────────
export function OnboardingWizard({ initialStep = 0 }: { initialStep?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saving, setSaving] = useState(false);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertHousehold({
        name: form.name || undefined,
        dietary_type: form.dietary_type,
        include_fish: form.include_fish,
        has_kids: form.has_kids,
        cuisines: form.cuisines,
        fusion_days: form.fusion_days,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        health_goal: form.health_goal,
        disliked_ingredients: form.disliked_ingredients,
        notes: form.notes,
      });
      setStep(6);
    } catch (e) {
      toast({ title: "Couldn't save", description: String(e), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const TOTAL = 5;

  return (
    <div className="space-y-6">
      {step < 6 && step > 0 && <Progress step={step} total={TOTAL} />}
      {step === 0 && <Step0 form={form} patch={patch} onNext={() => setStep(1)} />}
      {step === 1 && <Step1 form={form} patch={patch} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && <Step2 form={form} patch={patch} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <Step3 form={form} patch={patch} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
      {step === 4 && <Step4 form={form} patch={patch} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
      {step === 5 && <Step5 form={form} patch={patch} onBack={() => setStep(4)} onSave={handleSave} saving={saving} />}
      {step === 6 && <StepDone onGo={() => router.push("/home")} />}
    </div>
  );
}

// ─── Step 0: Welcome / name ────────────────────────────────────────────────────
function Step0({
  form,
  patch,
  onNext,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6 step-enter">
      <div className="text-center space-y-2">
        <div className="text-5xl">🍛</div>
        <h2 className="font-display text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          Welcome!
        </h2>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Let's set up your household in 5 quick steps.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Family name <span style={{ color: "var(--color-muted)" }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. The Sharmas"
          value={form.name}
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
      </div>

      <button type="button" onClick={onNext} className="btn-main w-full">
        Let's start →
      </button>
    </div>
  );
}

// ─── Step 1: Cuisines ─────────────────────────────────────────────────────────
function Step1({
  form,
  patch,
  onBack,
  onNext,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5 step-enter">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Which cuisines do you love?
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Pick all that apply — we'll balance suggestions accordingly.
        </p>
      </div>

      <CuisinePicker
        value={form.cuisines}
        onChange={(next) => patch("cuisines", next)}
      />

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1">← Back</button>
        <button type="button" onClick={onNext} className="btn-main flex-1">Next →</button>
      </div>
    </div>
  );
}

// ─── Step 2: Fusion days ──────────────────────────────────────────────────────
function Step2({
  form,
  patch,
  onBack,
  onNext,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5 step-enter">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Fusion days?
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Days when you're open to non-Indian cooking. Skip if always Indian.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FUSION_DAYS.map((d) => (
          <Chip
            key={d.id}
            label={d.label}
            active={form.fusion_days.includes(d.id)}
            onClick={() => patch("fusion_days", toggle(form.fusion_days, d.id))}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1">← Back</button>
        <button type="button" onClick={onNext} className="btn-main flex-1">Next →</button>
      </div>
    </div>
  );
}

// ─── Step 3: Diet + fish + kids ───────────────────────────────────────────────
function Step3({
  form,
  patch,
  onBack,
  onNext,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const dietOptions: DietaryType[] = ["vegetarian", "eggetarian", "non_vegetarian"];

  return (
    <div className="space-y-5 step-enter">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Dietary preference
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          We'll strictly follow this in every suggestion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {dietOptions.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => patch("dietary_type", d)}
            className={`radio-card${form.dietary_type === d ? " active" : ""}`}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: form.dietary_type === d ? "var(--color-accent)" : "var(--color-text)" }}
            >
              {DIETARY_LABELS[d]}
            </span>
          </button>
        ))}
      </div>

      {form.dietary_type === "non_vegetarian" && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.include_fish}
            onChange={(e) => patch("include_fish", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span className="text-sm" style={{ color: "var(--color-text)" }}>
            Include fish &amp; seafood
          </span>
        </label>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.has_kids}
          onChange={(e) => patch("has_kids", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text)" }}>
          I have young children (include kid-friendly meals)
        </span>
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1">← Back</button>
        <button type="button" onClick={onNext} className="btn-main flex-1">Next →</button>
      </div>
    </div>
  );
}

// ─── Step 4: Height / weight / health goal ────────────────────────────────────
function Step4({
  form,
  patch,
  onBack,
  onNext,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const bmi = calcBmi(form.height_cm, form.weight_kg);

  return (
    <div className="space-y-5 step-enter">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Your body &amp; goals
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Optional — helps us suggest nutritionally appropriate meals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
            Height (cm)
          </label>
          <input
            type="number"
            placeholder="e.g. 170"
            value={form.height_cm}
            onChange={(e) => patch("height_cm", e.target.value)}
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
          <label className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
            Weight (kg)
          </label>
          <input
            type="number"
            placeholder="e.g. 65"
            value={form.weight_kg}
            onChange={(e) => patch("weight_kg", e.target.value)}
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

      {bmi && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 10%, var(--color-card))",
            border: "1px solid color-mix(in srgb, var(--color-accent) 30%, var(--color-border))",
          }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>BMI</span>
          <span className="font-bold" style={{ color: "var(--color-accent)" }}>
            {bmi} — {bmiLabel(bmi)}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Health goal <span style={{ color: "var(--color-muted)" }}>(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {HEALTH_GOALS.map((g) => (
            <Chip
              key={g.id}
              label={g.label}
              active={form.health_goal === g.id}
              onClick={() => patch("health_goal", form.health_goal === g.id ? "" : g.id)}
            />
          ))}
        </div>
      </div>

      <ProteinGoalCard
        weightKg={form.weight_kg ? parseFloat(form.weight_kg) : null}
        healthGoal={form.health_goal}
      />

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1">← Back</button>
        <button type="button" onClick={onNext} className="btn-main flex-1">Next →</button>
      </div>
    </div>
  );
}

// ─── Step 5: Dislikes + notes → Save ─────────────────────────────────────────
function Step5({
  form,
  patch,
  onBack,
  onSave,
  saving,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5 step-enter">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          What do you dislike?
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          We'll never suggest these ingredients.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {DISLIKES.map((d) => (
          <Chip
            key={d}
            label={d}
            active={form.disliked_ingredients.includes(d)}
            onClick={() => patch("disliked_ingredients", toggle(form.disliked_ingredients, d))}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Additional notes <span style={{ color: "var(--color-muted)" }}>(optional)</span>
        </label>
        <textarea
          value={form.notes}
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
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1">← Back</button>
        <button type="button" onClick={onSave} disabled={saving} className="btn-main flex-1">
          {saving ? "Saving..." : "Save preferences 🎉"}
        </button>
      </div>
    </div>
  );
}

// ─── Done screen ───────────────────────────────────────────────────────────────
function StepDone({ onGo }: { onGo: () => void }) {
  return (
    <div className="text-center space-y-6 py-6 step-enter">
      <div className="flex justify-center">
        <div
          className="h-20 w-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: "color-mix(in srgb, var(--color-accent) 15%, var(--color-card))" }}
        >
          🎉
        </div>
      </div>
      <div>
        <h2 className="font-display text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          You're all set!
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
          Your household preferences are saved. Let's find out what to cook today.
        </p>
      </div>
      <button type="button" onClick={onGo} className="btn-main w-full">
        Get my meal plan →
      </button>
    </div>
  );
}
