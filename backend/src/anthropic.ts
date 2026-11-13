import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

export const hasApiKey = !!apiKey;

const client = apiKey ? new Anthropic({ apiKey }) : null;

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

function parseModelJson(text: string, context: string): any {
  try {
    return JSON.parse(extractJson(text));
  } catch (err) {
    console.error(`[${context}] Failed to parse model JSON output. Raw response:\n${text}`);
    throw new Error(`The model's response wasn't valid JSON (${(err as Error).message}). Try again.`);
  }
}

const VISUAL_TYPES = [
  "shape",
  "tape",
  "percent-grid",
  "fraction-bars",
  "number-line",
  "coordinate-plane",
  "circle",
  "angle",
  "solid",
  "pythagoras",
  "dot-plot",
  "none",
];

export async function generateLessonContent(opts: {
  grade: number;
  unitTitle: string;
  subtopicTitle: string;
}): Promise<any> {
  if (!client) throw new Error("NO_API_KEY");

  const prompt = `You are writing a lesson for a Grade ${opts.grade} middle-school math student.
Unit: "${opts.unitTitle}"
Sub-topic: "${opts.subtopicTitle}"

Respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching exactly this shape:
{
  "explanation": "2-4 sentences in plain, friendly language for a middle schooler, including a real-life example.",
  "example": { "steps": ["step 1", "step 2", "step 3", "step 4 (final answer)"] },
  "visual": { "type": "one of: ${VISUAL_TYPES.join(" | ")}", "props": { } },
  "practice": [
    { "prompt": "question 1", "choices": ["optional", "multiple choice options"], "answer": "the correct answer as a short string", "hint": "a helpful hint" },
    { "prompt": "question 2", "answer": "...", "hint": "..." },
    { "prompt": "question 3", "answer": "...", "hint": "..." }
  ]
}

Rules:
- Exactly 3 practice questions, each with a short "answer" string a simple string-equality check can grade, and a "hint".
- "choices" is optional — include it only for multiple-choice questions, omit it for free-response numeric/text questions.
- Pick the most fitting "visual.type" for this topic, or "none" if no visual fits. Keep "props" simple (numbers/strings/booleans only) describing what the visual should show (e.g. for "shape": {"shape":"triangle","base":6,"height":4,"unit":"cm"}; for "coordinate-plane": {"points":[{"x":1,"y":2}],"line":true}; for "circle": {"radius":5,"unit":"cm"}).
- Keep language appropriate for grade ${opts.grade}.`;

  const msg = await client.messages.create({
    model,
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  if (msg.stop_reason === "max_tokens") {
    console.error(`[generateLessonContent] Response was truncated (hit max_tokens). Raw response:\n${text}`);
    throw new Error("The model's response was cut off. Try again.");
  }

  return parseModelJson(text, "generateLessonContent");
}

export async function generateAlternateExplanation(opts: {
  grade: number;
  unitTitle: string;
  subtopicTitle: string;
  previousExplanation: string;
  mode: "simpler" | "new-example";
}): Promise<any> {
  if (!client) throw new Error("NO_API_KEY");

  const ask =
    opts.mode === "simpler"
      ? "Explain the same idea in an even SIMPLER way than the previous explanation — shorter sentences, a more basic real-life comparison, as if explaining to a student who is still confused."
      : "Keep the explanation similarly leveled, but use a DIFFERENT real-life example and a DIFFERENT worked example than before, so the student sees the idea from a new angle.";

  const prompt = `You are re-explaining a Grade ${opts.grade} math concept.
Unit: "${opts.unitTitle}"
Sub-topic: "${opts.subtopicTitle}"

The student already saw this explanation and wants another way to understand it:
"""${opts.previousExplanation}"""

${ask}

Respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching exactly:
{
  "explanation": "2-4 sentences, plain language, grade ${opts.grade} appropriate.",
  "example": { "steps": ["step 1", "step 2", "step 3", "final answer"] }
}`;

  const msg = await client.messages.create({
    model,
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  if (msg.stop_reason === "max_tokens") {
    console.error(`[generateAlternateExplanation] Response was truncated (hit max_tokens). Raw response:\n${text}`);
    throw new Error("The model's response was cut off. Try again.");
  }

  return parseModelJson(text, "generateAlternateExplanation");
}
