"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
}

export function ChipInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  className,
  suggestions = [],
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addChip(text: string) {
    const trimmed = text.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  }

  function removeChip(chip: string) {
    onChange(value.filter((v) => v !== chip));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeChip(value[value.length - 1]);
    }
  }

  const filteredSuggestions = suggestions.filter(
    (s) =>
      inputValue.length > 0 &&
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(s)
  );

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap gap-2 rounded-xl border-2 border-charcoal/20 bg-cream/60 p-3 focus-within:border-terracotta focus-within:bg-cream transition-colors min-h-[48px]">
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-lg bg-terracotta/15 text-terracotta px-3 py-1 text-sm font-medium"
          >
            {chip}
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="hover:text-terracotta/70 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none"
        />
      </div>
      {filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border-2 border-charcoal/10 bg-cream shadow-lg overflow-hidden">
          {filteredSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addChip(s)}
              className="w-full text-left px-4 py-2 text-sm text-charcoal hover:bg-terracotta/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
