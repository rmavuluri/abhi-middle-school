import { useState } from "react";
import type { PracticeQuestion as PracticeQuestionType } from "../types";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "").replace(/°/g, "");
}

export default function PracticeQuestion({
  question,
  index,
}: {
  question: PracticeQuestionType;
  index: number;
}) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);

  const check = (value: string) => {
    const isCorrect = normalize(value) === normalize(question.answer);
    setResult(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setShowHint(false);
  };

  const reset = () => {
    setInput("");
    setSelected(null);
    setResult(null);
    setShowHint(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/40">
      <p className="font-medium text-slate-800 dark:text-slate-100 mb-3">
        <span className="text-indigo-500 mr-1">{index + 1}.</span>
        {question.prompt}
      </p>

      {question.choices && question.choices.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {question.choices.map((choice) => {
            const isSelected = selected === choice;
            const isCorrectChoice = result && normalize(choice) === normalize(question.answer);
            return (
              <button
                key={choice}
                onClick={() => {
                  setSelected(choice);
                  check(choice);
                }}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  isSelected && result === "correct"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isSelected && result === "incorrect"
                    ? "bg-rose-500 border-rose-500 text-white"
                    : isCorrectChoice
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-400"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check(input)}
            placeholder="Your answer"
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() => check(input)}
            disabled={!input.trim()}
            className="rounded-lg bg-indigo-500 disabled:opacity-40 text-white text-sm px-4 py-1.5 hover:bg-indigo-600 transition-colors"
          >
            Check
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {result === "correct" && (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ Correct, nice work!</span>
        )}
        {result === "incorrect" && (
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">✗ Not quite — try again.</span>
        )}
        {result === "incorrect" && (
          <button
            onClick={() => setShowHint((s) => !s)}
            className="text-sm text-indigo-500 hover:text-indigo-600 underline"
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {result && (
          <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline">
            Reset
          </button>
        )}
      </div>

      {showHint && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          💡 {question.hint}
        </p>
      )}
    </div>
  );
}
