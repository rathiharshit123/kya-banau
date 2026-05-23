"use client";

import React from "react";
import { MEAL_TIMES, type MealTime } from "@/lib/types";

interface MealTimePickerProps {
  value: MealTime | null;
  onChange: (v: MealTime) => void;
}

export function MealTimePicker({ value, onChange }: MealTimePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MEAL_TIMES.map((mt) => (
        <button
          key={mt.id}
          type="button"
          onClick={() => onChange(mt.id as MealTime)}
          className={`radio-card text-left${value === mt.id ? " active" : ""}`}
        >
          <span className="text-2xl">{mt.emoji}</span>
          <span
            className="text-sm font-semibold"
            style={{ color: value === mt.id ? "var(--color-accent)" : "var(--color-text)" }}
          >
            {mt.label}
          </span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {mt.desc}
          </span>
        </button>
      ))}
    </div>
  );
}
