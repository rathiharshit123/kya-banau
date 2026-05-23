import { getOrCreateDeviceId } from "./device-id";
import type {
  Household,
  HouseholdUpsert,
  SuggestRequest,
  SuggestionItem,
  MealLog,
  MealHistoryItem,
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

// Household
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

// Suggestions
export async function fetchSuggestions(
  body: SuggestRequest
): Promise<{ suggestions: SuggestionItem[]; suggestion_id: string }> {
  const res = await fetch("/api/suggestions", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<{ suggestions: SuggestionItem[]; suggestion_id: string }>(res);
}

// Meals
export async function logMeal(body: MealLog): Promise<void> {
  const res = await fetch("/api/meals", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<void>(res);
}

export async function fetchMealHistory(days = 14): Promise<MealHistoryItem[]> {
  const res = await fetch(`/api/meals?days=${days}`, { headers: headers() });
  return handleResponse<MealHistoryItem[]>(res);
}
