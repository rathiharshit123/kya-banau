"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { upsertHousehold } from "@/lib/api-client";
import { toast } from "@/lib/use-toast";
import {
  DIETARY_LABELS,
  CUISINE_LABELS,
  type DietaryType,
  type RegionalCuisine,
} from "@/lib/types";

const POPULAR_DISHES = [
  "Aloo Gobi",
  "Dal Tadka",
  "Paneer Butter Masala",
  "Rajma",
  "Chole",
  "Biryani",
  "Khichdi",
  "Poha",
  "Upma",
  "Idli Sambhar",
  "Dosa",
  "Paratha",
  "Roti Sabzi",
  "Pulao",
  "Kadhi Chawal",
  "Palak Paneer",
  "Matar Paneer",
  "Baingan Bharta",
  "Moong Dal",
  "Chicken Curry",
  "Egg Bhurji",
  "Fish Fry",
];

const POPULAR_INGREDIENTS = [
  "Onion",
  "Garlic",
  "Potato",
  "Tomato",
  "Capsicum",
  "Cauliflower",
  "Spinach",
  "Coconut",
  "Mustard seeds",
  "Cumin",
];

interface FormState {
  name: string;
  dietary_type: DietaryType;
  regional_cuisine: RegionalCuisine;
  family_size: number;
  spice_level: number;
  loved_dishes: string[];
  disliked_dishes: string[];
  disliked_ingredients: string[];
  notes: string;
}

const INITIAL: FormState = {
  name: "",
  dietary_type: "vegetarian",
  regional_cuisine: "north_indian",
  family_size: 2,
  spice_level: 3,
  loved_dishes: [],
  disliked_dishes: [],
  disliked_ingredients: [],
  notes: "",
};

export function OnboardingWizard({ initialStep = 0 }: { initialStep?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saving, setSaving] = useState(false);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await upsertHousehold(form);
      setStep(3);
    } catch (e) {
      toast({ title: "Couldn't save", description: String(e), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const TOTAL = 3;
  const progress = ((step + 1) / (TOTAL + 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      {step < 3 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-charcoal/50">
            <span>Step {step + 1} of {TOTAL}</span>
            <span>{Math.round(progress)}% done</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-charcoal/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {step === 0 && (
        <StepOne form={form} patch={patch} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <StepTwo form={form} patch={patch} onBack={() => setStep(0)} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <StepThree form={form} patch={patch} onBack={() => setStep(1)} onSave={save} saving={saving} />
      )}
      {step === 3 && (
        <StepDone onGo={() => router.push("/home")} />
      )}
    </div>
  );
}

function StepOne({
  form,
  patch,
  onNext,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5 fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-charcoal">
          Tell us about your family
        </h2>
        <p className="mt-1 text-sm text-charcoal/60">Quick basics — takes 30 seconds.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Family name (optional)</Label>
          <Input
            id="name"
            placeholder="e.g. The Sharmas"
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Dietary preference</Label>
          <Select
            value={form.dietary_type}
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
            value={form.regional_cuisine}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="family_size">Family size</Label>
            <Input
              id="family_size"
              type="number"
              min={1}
              max={20}
              value={form.family_size}
              onChange={(e) => patch("family_size", parseInt(e.target.value) || 2)}
            />
          </div>
          <div className="col-span-1" />
        </div>

        <SpiceSlider
          value={form.spice_level}
          onChange={(v) => patch("spice_level", v)}
        />
      </div>

      <Button onClick={onNext} size="lg" className="w-full">
        Next →
      </Button>
    </div>
  );
}

function StepTwo({
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
    <div className="space-y-5 fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-charcoal">
          Your food preferences
        </h2>
        <p className="mt-1 text-sm text-charcoal/60">
          Help us suggest dishes you'll actually want to make.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Dishes you love ❤️</Label>
          <ChipInput
            value={form.loved_dishes}
            onChange={(v) => patch("loved_dishes", v)}
            placeholder="e.g. Dal Makhani, Biryani..."
            suggestions={POPULAR_DISHES}
          />
          <p className="text-xs text-charcoal/40">
            Type a dish and press Enter, or pick from suggestions
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Dishes to avoid 🚫</Label>
          <ChipInput
            value={form.disliked_dishes}
            onChange={(v) => patch("disliked_dishes", v)}
            placeholder="e.g. Bhindi, Karela..."
            suggestions={POPULAR_DISHES}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Ingredients to avoid</Label>
          <ChipInput
            value={form.disliked_ingredients}
            onChange={(v) => patch("disliked_ingredients", v)}
            placeholder="e.g. Garlic, Coconut..."
            suggestions={POPULAR_INGREDIENTS}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Next →
        </Button>
      </div>
    </div>
  );
}

function StepThree({
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
    <div className="space-y-5 fade-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-charcoal">
          Anything else?
        </h2>
        <p className="mt-1 text-sm text-charcoal/60">
          Optional notes — allergies, preferences, anything the AI should know.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Free-text notes</Label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => patch("notes", e.target.value)}
          placeholder="e.g. We prefer less oily food. Dad is diabetic so avoid very sweet dishes..."
          rows={4}
          className="flex w-full rounded-xl border-2 border-charcoal/20 bg-cream/60 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus-visible:outline-none focus-visible:border-terracotta focus-visible:bg-cream transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Back
        </Button>
        <Button onClick={onSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save & Start 🎉"}
        </Button>
      </div>
    </div>
  );
}

function StepDone({ onGo }: { onGo: () => void }) {
  return (
    <div className="text-center space-y-6 fade-up py-4">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-3xl bg-forest/15 flex items-center justify-center text-4xl animate-bounce">
          🎉
        </div>
      </div>
      <div>
        <h2 className="font-display text-3xl font-bold text-charcoal">
          You're all set!
        </h2>
        <p className="mt-2 text-charcoal/60">
          Your household preferences are saved. Let's find out what to cook today.
        </p>
      </div>
      <Button size="lg" onClick={onGo} className="w-full shadow-lg shadow-terracotta/25">
        Get my suggestions →
      </Button>
    </div>
  );
}
