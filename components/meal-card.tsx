"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Play, Youtube } from "lucide-react";
import { fetchRecipeVideos, logMealInteraction } from "@/lib/api-client";
import type { Meal, RecipeVideo } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  index?: number;
  suggestionId?: string | null;
}

function tagClass(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("veg") && !t.includes("non")) return "tag-veg";
  if (t.includes("non-veg") || t.includes("chicken") || t.includes("meat") || t.includes("fish")) return "tag-nonveg";
  return "tag-other";
}

export function MealCard({ meal, index = 0, suggestionId }: MealCardProps) {
  const [recipeExpanded, setRecipeExpanded] = useState(false);
  const [videosExpanded, setVideosExpanded] = useState(false);
  const [videos, setVideos] = useState<RecipeVideo[] | null>(null);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  const mealTypeEmoji: Record<string, string> = {
    Breakfast: "☀️",
    Lunch: "🌤️",
    Dinner: "🌙",
    Snack: "🍎",
  };

  function interactionContext() {
    return {
      suggestion_id: suggestionId,
      meal_type: meal.meal_type,
      day: meal.day,
    };
  }

  function handleQuickRecipeToggle() {
    setRecipeExpanded((prev) => {
      if (!prev) {
        logMealInteraction({
          meal_name: meal.name,
          interaction_type: "quick_recipe",
          ...interactionContext(),
        });
      }
      return !prev;
    });
  }

  async function handleWatchVideos() {
    if (videosExpanded) {
      setVideosExpanded(false);
      return;
    }

    setVideosExpanded(true);

    if (videos !== null) return;

    setVideosLoading(true);
    setVideosError(null);

    try {
      const result = await fetchRecipeVideos(meal.name, interactionContext());
      setVideos(result.videos);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not load recipe videos";
      setVideosError(msg);
    } finally {
      setVideosLoading(false);
    }
  }

  return (
    <div
      className="meal-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* meal_type + day badge */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
                {mealTypeEmoji[meal.meal_type] ?? "🍽️"} {meal.meal_type}
              </span>
              <span className="deco-dot" />
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {meal.day}
              </span>
              {meal.kid_friendly && (
                <>
                  <span className="deco-dot" />
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>👶 Kid-friendly</span>
                </>
              )}
            </div>
            <h3
              className="font-display text-lg font-bold leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              {meal.name}
            </h3>
            <p className="mt-1 text-sm leading-snug" style={{ color: "var(--color-muted)" }}>
              {meal.description}
            </p>
          </div>
        </div>

        {/* Macro pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="macro-pill">🥩 {meal.protein} protein</span>
          <span className="macro-pill">🌾 {meal.carbs} carbs</span>
          <span className="macro-pill">🔥 {meal.calories}</span>
        </div>

        {/* Tags */}
        {meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {meal.tags.map((tag) => (
              <span key={tag} className={tagClass(tag)}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Why healthy bar */}
      <div
        className="px-4 py-2.5 border-t text-xs"
        style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
      >
        💚 {meal.why_healthy}
      </div>

      {/* Expandable recipe */}
      <div style={{ borderTop: `1px solid var(--color-border)` }}>
        <button
          type="button"
          onClick={handleQuickRecipeToggle}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold transition-colors"
          style={{ color: recipeExpanded ? "var(--color-accent)" : "var(--color-muted)" }}
        >
          <span>Quick Recipe</span>
          {recipeExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {recipeExpanded && (
          <div className="px-4 pb-4">
            <ol className="space-y-2">
              {meal.how_to_make.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--color-text)" }}>
                  <span
                    className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* YouTube recipe videos — fetched on demand */}
      <div style={{ borderTop: `1px solid var(--color-border)` }}>
        <button
          type="button"
          onClick={handleWatchVideos}
          disabled={videosLoading}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-70"
          style={{ color: videosExpanded ? "#ff4444" : "var(--color-muted)" }}
        >
          <span className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            Watch Recipe Video
          </span>
          {videosLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : videosExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {videosExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {videosLoading && (
              <div className="flex items-center gap-2 text-sm py-2" style={{ color: "var(--color-muted)" }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding Indian home-style recipes…
              </div>
            )}

            {videosError && (
              <p className="text-sm py-1" style={{ color: "#f87171" }}>
                {videosError}
              </p>
            )}

            {!videosLoading && !videosError && videos?.length === 0 && (
              <p className="text-sm py-1" style={{ color: "var(--color-muted)" }}>
                No recipe videos found. Try searching on YouTube directly.
              </p>
            )}

            {videos?.map((video) => (
              <a
                key={video.video_id}
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="recipe-video-card group"
                onClick={() =>
                  logMealInteraction({
                    meal_name: meal.name,
                    interaction_type: "video_click",
                    ...interactionContext(),
                    metadata: {
                      video_id: video.video_id,
                      video_title: video.title,
                      channel_name: video.channel_name,
                      video_url: video.video_url,
                    },
                  })
                }
              >
                <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden">
                  {video.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "var(--color-border)" }}
                    >
                      <Play className="h-5 w-5" style={{ color: "var(--color-muted)" }} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium leading-snug line-clamp-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {video.title}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-muted)" }}>
                    {video.channel_name}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-muted)" }} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
