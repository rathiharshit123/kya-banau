"use client";

import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

type Toast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string };

interface ToastState {
  toasts: Toast[];
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 3000;

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "REMOVE_TOAST":
      return {
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
  }
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type Dispatch = React.Dispatch<ToastAction>;
const listeners: Dispatch[] = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(action));
}

function toast(props: Omit<Toast, "id">) {
  const id = genId();
  dispatch({ type: "ADD_TOAST", toast: { ...props, id } });
  setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), TOAST_REMOVE_DELAY);
}

export function useToast() {
  const [state, localDispatch] = React.useReducer(reducer, memoryState);

  React.useEffect(() => {
    listeners.push(localDispatch);
    return () => {
      const index = listeners.indexOf(localDispatch);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts: state.toasts, toast };
}

export { toast };
