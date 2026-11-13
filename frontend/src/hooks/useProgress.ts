import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mce-progress-v1";

function load(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // ignore (private mode / storage full)
    }
  }, [completed]);

  const isCompleted = useCallback((id: string) => !!completed[id], [completed]);

  const toggleCompleted = useCallback((id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setCompletedValue = useCallback((id: string, value: boolean) => {
    setCompleted((prev) => ({ ...prev, [id]: value }));
  }, []);

  return { completed, isCompleted, toggleCompleted, setCompletedValue };
}
