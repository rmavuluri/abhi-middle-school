import { useEffect, useState } from "react";
import type { AlternateExplanation, GradeData, Subtopic, Unit } from "../types";
import { useLessonContent } from "../hooks/useLessonContent";
import { fetchAlternateExplanation } from "../utils/api";
import Visual from "./Visual";
import PracticeQuestion from "./PracticeQuestion";

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch {
    return null;
  }
}

export default function LessonPage({
  grade,
  unit,
  subtopic,
  isCompleted,
  onToggleCompleted,
}: {
  grade: GradeData;
  unit: Unit;
  subtopic: Subtopic;
  isCompleted: boolean;
  onToggleCompleted: () => void;
}) {
  const { content, loading, error, retry } = useLessonContent(grade, unit, subtopic);
  const [alt, setAlt] = useState<AlternateExplanation | null>(null);
  const [altLoading, setAltLoading] = useState<"simpler" | "new-example" | null>(null);
  const [altError, setAltError] = useState<string | null>(null);
  const [altIndex, setAltIndex] = useState<number | null>(null);

  useEffect(() => {
    setAlt(null);
    setAltError(null);
    setAltIndex(null);
  }, [subtopic.id]);

  const embedUrl = subtopic.videoUrl ? getYouTubeEmbedUrl(subtopic.videoUrl) : null;

  const requestAlternate = async (mode: "simpler" | "new-example") => {
    if (!content) return;
    setAltLoading(mode);
    setAltError(null);
    try {
      const res = await fetchAlternateExplanation({
        subtopicId: subtopic.id,
        grade: grade.grade,
        unitTitle: unit.title,
        subtopicTitle: subtopic.title,
        previousExplanation: alt?.explanation || content.explanation,
        mode,
      });
      setAlt(res.alternate);
      setAltIndex(res.index);
    } catch (err: any) {
      setAltError(err.message || "Could not generate an alternate explanation.");
    } finally {
      setAltLoading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <p className="text-sm text-indigo-500 font-medium">{grade.title} · {unit.title}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{subtopic.title}</h1>
        </div>
        <button
          onClick={onToggleCompleted}
          className={`shrink-0 text-sm font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400"
          }`}
        >
          {isCompleted ? "✓ Completed" : "Mark complete"}
        </button>
      </div>

      {loading && (
        <div className="mt-8 space-y-3 animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          <p className="text-sm text-slate-400 pt-2">Generating this lesson with Claude...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          <button onClick={retry} className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400 underline">
            Try again
          </button>
        </div>
      )}

      {content && (
        <div className="mt-6 space-y-8">
          {/* 1. Explanation */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Explanation</h2>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
              {alt ? alt.explanation : content.explanation}
            </p>

            {alt && (
              <button onClick={() => setAlt(null)} className="mt-2 text-sm text-indigo-500 hover:text-indigo-600 underline">
                Show original explanation
              </button>
            )}
          </section>

          {/* 2. Worked example */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Worked Example</h2>
            <ol className="space-y-2">
              {(alt ? alt.example.steps : content.example.steps).map((step, i) => (
                <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-200">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-sm flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 3. Visual */}
          {content.visual && content.visual.type !== "none" && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Visual</h2>
              <Visual spec={content.visual} />
            </section>
          )}

          {/* 4. Video */}
          {embedUrl && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Video</h2>
              <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe
                  src={embedUrl}
                  title={`${subtopic.title} video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* 5. Explain it differently */}
          <section>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => requestAlternate("simpler")}
                disabled={altLoading !== null}
                className="text-sm font-medium px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 transition-colors"
              >
                {altLoading === "simpler" ? "Simplifying..." : "✨ Explain it more simply"}
              </button>
              <button
                onClick={() => requestAlternate("new-example")}
                disabled={altLoading !== null}
                className="text-sm font-medium px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 transition-colors"
              >
                {altLoading === "new-example" ? "Thinking of a new example..." : "🔄 Try a different example"}
              </button>
              {altIndex !== null && (
                <span className="text-xs text-slate-400 self-center">alt. explanation #{altIndex + 1}</span>
              )}
            </div>
            {altError && <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{altError}</p>}
          </section>

          {/* 6. Practice questions */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Practice</h2>
            <div className="space-y-3">
              {content.practice.map((q, i) => (
                <PracticeQuestion key={i} question={q} index={i} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
