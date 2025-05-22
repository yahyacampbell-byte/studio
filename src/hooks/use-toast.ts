
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type { ToastProps as RadixToastProps } from "@radix-ui/react-toast"; // Corrected path if needed
import type { ToastActionElement } from "@/components/ui/toast"; // Assuming this path is correct based on shadcn setup

const TOAST_LIMIT = 3; // Allow a few toasts
const TOAST_REMOVE_DELAY = 5000; // Auto-remove after 5 seconds

// Use RadixToastProps for the base, and add our specific fields
type ToasterToast = RadixToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"; // Ensure variant is part of the type
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId)); // Clear existing timeout if any
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add new toast to the beginning, and ensure limit is respected
      const newToasts = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT);
      // For each new toast added, set up its removal timer
      if (!toastTimeouts.has(action.toast.id)) { // Only if not already managed (e.g., via dismiss)
        addToRemoveQueue(action.toast.id);
      }
      return {
        ...state,
        toasts: newToasts,
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        // If a specific toast is dismissed, clear its auto-remove timeout and start a new one for quicker removal
        if (toastTimeouts.has(toastId)) clearTimeout(toastTimeouts.get(toastId));
        addToRemoveQueue(toastId); // This will set a new timeout for removal
      } else {
        // Dismiss all: clear all timeouts and set new ones
        state.toasts.forEach((toast) => {
          if (toastTimeouts.has(toast.id)) clearTimeout(toastTimeouts.get(toast.id));
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark as not open, UI will animate out
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// This is the exposed Toast function type
export type ToastFunction = (props: Omit<ToasterToast, "id" | "open" | "onOpenChange">) => {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
};


const toast: ToastFunction = ({ ...props }) => {
  const id = genId()

  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updateProps, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          // When Radix signals close (e.g. animation ends or swipe), we ensure it's dismissed
          dismiss();
        }
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
