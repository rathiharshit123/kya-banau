"use client";

import React from "react";
import { cn } from "@/lib/utils";

const SPICE_LABELS = ["", "Very Mild", "Mild", "Medium", "Hot", "Fiery 🌶️"];

interface SpiceSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function SpiceSlider({ value, onChange, className }: SpiceSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-charcoal/60">Spice Level</span>
        <span className="text-sm font-semibold text-terracotta">
          {SPICE_LABELS[value]}
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              "flex-1 h-2.5 rounded-full transition-all duration-200",
              level <= value
                ? "bg-terracotta"
                : "bg-charcoal/15 hover:bg-charcoal/25"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-charcoal/40">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
}
