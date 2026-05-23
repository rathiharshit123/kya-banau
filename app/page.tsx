"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const TAGLINES = [
  "Every day's hardest question — answered.",
  "Personalised Indian meal ideas for your family.",
  "No more 'kuch bhi bana do' moments.",
];

export default function LandingPage() {
  const router = useRouter();

  function handleStart() {
    router.push("/onboarding");
  }

  function handleHome() {
    router.push("/home");
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-saffron/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-terracotta/15 blur-3xl"
      />

      <div className="relative z-10 max-w-sm w-full space-y-8 text-center fade-up">
        {/* Logo mark */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-3xl bg-terracotta shadow-xl shadow-terracotta/30 flex items-center justify-center rotate-3">
            <span className="text-4xl">🍛</span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-display text-5xl font-bold text-charcoal leading-[1.1] tracking-tight">
            Aaj <span className="text-terracotta italic">kya</span>
            <br />
            banau?
          </h1>
          <p className="text-base text-charcoal/60 leading-relaxed">
            {TAGLINES[1]}
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {[
            "🌶️ Personalised to your taste",
            "🏠 Regional cuisine",
            "🧠 AI-powered",
            "📱 Free, forever",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border border-charcoal/15 bg-cream px-3 py-1.5 text-charcoal/70 font-medium"
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={handleStart}
            className="w-full shadow-lg shadow-terracotta/25"
          >
            Set up my household →
          </Button>
          <button
            type="button"
            onClick={handleHome}
            className="text-sm text-charcoal/50 hover:text-terracotta transition-colors underline underline-offset-2"
          >
            Already set up? Go to suggestions
          </button>
        </div>

        <p className="text-xs text-charcoal/30">
          No sign-up needed · Works on your phone
        </p>
      </div>
    </main>
  );
}
