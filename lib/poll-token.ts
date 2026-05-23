import { v4 as uuidv4 } from "uuid";

const VOTER_TOKEN_KEY = "kya-banau-voter-token";

function getStorage(): Storage | null {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    typeof window.localStorage.getItem !== "function"
  ) {
    return null;
  }
  return window.localStorage;
}

export function getOrCreateVoterToken(): string {
  const storage = getStorage();
  if (!storage) {
    throw new Error("getOrCreateVoterToken must only be called on the client");
  }

  let token = storage.getItem(VOTER_TOKEN_KEY);
  if (!token) {
    token = uuidv4();
    storage.setItem(VOTER_TOKEN_KEY, token);
  }
  return token;
}
