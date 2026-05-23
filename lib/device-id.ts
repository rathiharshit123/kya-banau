import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "kya-banau-device-id";

function getStorage(): Storage | null {
  // Use window.localStorage explicitly — avoids Node.js 25's partial localStorage global.
  // window.localStorage is only available in a real browser context.
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    typeof window.localStorage.getItem !== "function"
  ) {
    return null;
  }
  return window.localStorage;
}

export function getOrCreateDeviceId(): string {
  const storage = getStorage();
  if (!storage) {
    throw new Error("getOrCreateDeviceId must only be called on the client");
  }
  let id = storage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    storage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceId(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(DEVICE_ID_KEY);
}
