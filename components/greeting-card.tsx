import React from "react";

interface GreetingCardProps {
  greeting: string;
  tip: string;
}

export function GreetingCard({ greeting, tip }: GreetingCardProps) {
  return (
    <div
      className="card"
      style={{
        background: "color-mix(in srgb, var(--color-accent) 8%, var(--color-card))",
        borderColor: "color-mix(in srgb, var(--color-accent) 30%, var(--color-border))",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">👨‍🍳</span>
        <div className="space-y-2">
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--color-text)" }}>
            {greeting}
          </p>
          <div
            className="flex items-start gap-2 text-sm rounded-lg px-3 py-2"
            style={{ background: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}
          >
            <span className="flex-shrink-0">💡</span>
            <span>{tip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
