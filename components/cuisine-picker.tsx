"use client";

import React, { useState } from "react";
import { CUISINES, PREDEFINED_CUISINE_IDS } from "@/lib/types";

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

interface CuisinePickerProps {
  value: string[];
  onChange: (cuisines: string[]) => void;
}

export function CuisinePicker({ value, onChange }: CuisinePickerProps) {
  const [customInput, setCustomInput] = useState("");
  const customCuisines = value.filter((c) => !PREDEFINED_CUISINE_IDS.has(c));

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (value.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomInput("");
      return;
    }
    onChange([...value, trimmed]);
    setCustomInput("");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {CUISINES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(toggle(value, c.id))}
            className={`radio-card text-left${value.includes(c.id) ? " active" : ""}`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: value.includes(c.id) ? "var(--color-accent)" : "var(--color-text)" }}
            >
              {c.label}
            </span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {c.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
          Something else
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="e.g. Thai, Mexican, Mediterranean…"
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: "var(--color-card)",
              border: "1.5px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <button type="button" onClick={addCustom} className="btn-ghost shrink-0 px-4">
            Add
          </button>
        </div>
        {customCuisines.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customCuisines.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(value.filter((x) => x !== c))}
                className="chip active"
              >
                {c}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
