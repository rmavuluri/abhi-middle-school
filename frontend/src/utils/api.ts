import type { AlternateExplanation, LessonContent } from "../types";

// In dev, Vite proxies "/api" to the local backend (see vite.config.ts).
// In production (e.g. Netlify), there's no co-located backend, so this must
// point at the deployed backend's URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface GenerateArgs {
  subtopicId: string;
  grade: number;
  unitTitle: string;
  subtopicTitle: string;
}

export async function fetchGeneratedContent(
  args: GenerateArgs
): Promise<{ content: LessonContent; cached: boolean }> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

interface ExplainDifferentlyArgs extends GenerateArgs {
  previousExplanation: string;
  mode: "simpler" | "new-example";
  index?: number;
}

export async function fetchAlternateExplanation(
  args: ExplainDifferentlyArgs
): Promise<{ alternate: AlternateExplanation; index: number; totalAlternates: number; cached: boolean }> {
  const res = await fetch(`${API_BASE}/api/explain-differently`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }
  return res.json();
}
