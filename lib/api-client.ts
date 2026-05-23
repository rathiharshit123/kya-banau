import { getOrCreateDeviceId } from "./device-id";
import type {
  Household,
  HouseholdUpsert,
  SuggestRequest,
  MealPlan,
  RecipeVideosResponse,
  MealInteractionRequest,
} from "./types";

function householdId(): string {
  return getOrCreateDeviceId();
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-household-id": householdId(),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export async function fetchHousehold(): Promise<Household> {
  const res = await fetch("/api/household", { headers: headers() });
  return handleResponse<Household>(res);
}

export async function upsertHousehold(body: HouseholdUpsert): Promise<Household> {
  const res = await fetch("/api/household", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<Household>(res);
}

export async function fetchSuggestions(
  body: SuggestRequest
): Promise<MealPlan & { suggestion_id: string }> {
  const res = await fetch("/api/suggestions", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<MealPlan & { suggestion_id: string }>(res);
}

export async function fetchRecipeVideos(
  dishName: string,
  context?: Pick<MealInteractionRequest, "suggestion_id" | "meal_type" | "day">
): Promise<RecipeVideosResponse> {
  const res = await fetch("/api/recipe-videos", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      dish_name: dishName,
      suggestion_id: context?.suggestion_id,
      meal_type: context?.meal_type,
      day: context?.day,
    }),
  });
  return handleResponse<RecipeVideosResponse>(res);
}

/** Fire-and-forget — never blocks UI or throws */
export function logMealInteraction(body: MealInteractionRequest): void {
  fetch("/api/meal-interactions", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  }).catch(() => {});
}
