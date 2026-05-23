import { OnboardingWizard } from "@/components/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center px-6 py-10"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-2xl flex items-center justify-center text-lg"
            style={{ background: "color-mix(in srgb, var(--color-accent) 20%, var(--color-card))", border: "1px solid var(--color-border)" }}
          >
            🍛
          </div>
          <span className="font-display text-xl font-bold" style={{ color: "var(--color-text)" }}>
            Kya Banau?
          </span>
        </div>

        <OnboardingWizard />
      </div>
    </main>
  );
}
