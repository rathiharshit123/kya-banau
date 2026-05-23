"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
      />

      <div className="relative z-10 max-w-sm w-full space-y-8 text-center step-enter">
        {/* Logo */}
        <div className="flex justify-center">
          <div
            className="h-20 w-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl rotate-3"
            style={{ background: "color-mix(in srgb, var(--color-accent) 20%, var(--color-card))", border: "1px solid var(--color-border)" }}
          >
            🍛
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight" style={{ color: "var(--color-text)" }}>
            Aaj{" "}
            <span style={{ color: "var(--color-accent)" }} className="italic">
              kya
            </span>
            <br />
            banau?
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
            AI-powered Indian meal plans, personalised to your family's taste and health goals.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {[
            "🌶️ Regional cuisines",
            "💪 Macro-aware",
            "👨‍🍳 Quick recipes",
            "📱 Free, forever",
          ].map((f) => (
            <span key={f} className="chip">
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="btn-main w-full text-base"
          >
            Set up my household →
          </button>
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="text-sm transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            Already set up?{" "}
            <span style={{ color: "var(--color-accent)" }} className="underline underline-offset-2">
              Go to suggestions
            </span>
          </button>
        </div>

        <p className="text-xs" style={{ color: "color-mix(in srgb, var(--color-muted) 60%, transparent)" }}>
          No sign-up needed · Works on your phone
        </p>
      </div>
    </main>
  );
}
