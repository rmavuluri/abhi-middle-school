import express from "express";
import cors from "cors";
import {
  hasApiKey,
  generateLessonContent,
  generateAlternateExplanation,
} from "./anthropic.js";
import { getBase, setBase, getAlternates, addAlternate } from "./cache.js";

const app = express();
// Comma-separated list of allowed origins (e.g. your Netlify site URL).
// Defaults to "*" for easy local/dev use; lock this down in production.
const allowedOrigins = process.env.FRONTEND_URL?.split(",").map((s) => s.trim());
app.use(cors({ origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, apiKeyConfigured: hasApiKey });
});

// Generate (and cache) the base lesson content for a sub-topic that has no
// hand-authored content yet.
app.post("/api/generate", async (req, res) => {
  const { subtopicId, grade, unitTitle, subtopicTitle } = req.body || {};
  if (!subtopicId || !grade || !unitTitle || !subtopicTitle) {
    res.status(400).json({ error: "Missing subtopicId, grade, unitTitle, or subtopicTitle." });
    return;
  }

  const cached = getBase(subtopicId);
  if (cached) {
    res.json({ content: cached, cached: true });
    return;
  }

  if (!hasApiKey) {
    res.status(503).json({
      error: "NO_API_KEY",
      message: "Set ANTHROPIC_API_KEY on the backend to generate lesson content for this topic.",
    });
    return;
  }

  try {
    const content = await generateLessonContent({ grade, unitTitle, subtopicTitle });
    setBase(subtopicId, content);
    res.json({ content, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GENERATION_FAILED", message: String((err as Error)?.message || err) });
  }
});

// "Explain it differently" — generates (and caches) an alternate explanation.
// If `index` is passed and already cached, returns the cached version instead
// of calling the API again.
app.post("/api/explain-differently", async (req, res) => {
  const { subtopicId, grade, unitTitle, subtopicTitle, previousExplanation, mode, index } = req.body || {};
  if (!subtopicId || !grade || !unitTitle || !subtopicTitle || !previousExplanation) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  const alternates = getAlternates(subtopicId);
  if (typeof index === "number" && alternates[index]) {
    res.json({ alternate: alternates[index], index, totalAlternates: alternates.length, cached: true });
    return;
  }

  if (!hasApiKey) {
    res.status(503).json({
      error: "NO_API_KEY",
      message: "Set ANTHROPIC_API_KEY on the backend to use 'Explain it differently'.",
    });
    return;
  }

  try {
    const alternate = await generateAlternateExplanation({
      grade,
      unitTitle,
      subtopicTitle,
      previousExplanation,
      mode: mode === "simpler" ? "simpler" : "new-example",
    });
    const newIndex = addAlternate(subtopicId, alternate);
    res.json({ alternate, index: newIndex, totalAlternates: newIndex + 1, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GENERATION_FAILED", message: String((err as Error)?.message || err) });
  }
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Math Concept Explorer backend listening on http://localhost:${port}`);
  console.log(`Anthropic API key configured: ${hasApiKey}`);
});
