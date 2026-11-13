import type { AlternateExplanation, LessonContent } from "../types";

interface GenerateArgs {
  subtopicId: string;
  grade: number;
  unitTitle: string;
  subtopicTitle: string;
}

export async function fetchGeneratedContent(
  args: GenerateArgs
): Promise<{ content: LessonContent; cached: boolean }> {
  const res = await fetch("/api/generate", {
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
  const res = await fetch("/api/explain-differently", {
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
