"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getOrCreateDeviceId } from "@/lib/device-id";
import { upsertHousehold } from "@/lib/api-client";

interface DeviceIdContextValue {
  deviceId: string | null;
  ready: boolean;
}

const DeviceIdContext = createContext<DeviceIdContextValue>({
  deviceId: null,
  ready: false,
});

export function DeviceIdProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Guard: only run in a real browser with proper localStorage
    if (typeof window === "undefined" || typeof window.localStorage?.getItem !== "function") {
      return;
    }

    const id = getOrCreateDeviceId();
    setDeviceId(id);

    // Ensure household row exists (upsert with no fields is a no-op if row present)
    upsertHousehold({})
      .catch(() => {/* silently ignore if Supabase not configured yet */})
      .finally(() => setReady(true));
  }, []);

  return (
    <DeviceIdContext.Provider value={{ deviceId, ready }}>
      {children}
    </DeviceIdContext.Provider>
  );
}

export function useDeviceId() {
  return useContext(DeviceIdContext);
}
