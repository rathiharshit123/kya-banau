import { OnboardingWizard } from "@/components/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-terracotta flex items-center justify-center text-xl shadow-md shadow-terracotta/25">
            🍛
          </div>
          <span className="font-display text-xl font-bold text-charcoal">
            Kya Banau?
          </span>
        </div>

        <OnboardingWizard />
      </div>
    </main>
  );
}
