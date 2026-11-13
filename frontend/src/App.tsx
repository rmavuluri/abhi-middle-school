import { useMemo, useState } from "react";
import syllabus from "./data/syllabus.json";
import type { GradeData, Subtopic, Unit } from "./types";
import Sidebar from "./components/Sidebar";
import LessonPage from "./components/LessonPage";
import { useProgress } from "./hooks/useProgress";

const data = syllabus as GradeData[];

interface Selection {
  grade: GradeData;
  unit: Unit;
  subtopic: Subtopic;
}

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCompleted, toggleCompleted, completed } = useProgress();

  const stats = useMemo(() => {
    let total = 0;
    for (const g of data) for (const u of g.units) total += u.subtopics.length;
    const done = Object.values(completed).filter(Boolean).length;
    return { total, done };
  }, [completed]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        data={data}
        selectedId={selection?.subtopic.id ?? null}
        onSelect={(grade, unit, subtopic) => setSelection({ grade, unit, subtopic })}
        isCompleted={isCompleted}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open topic menu"
          >
            <svg className="w-5 h-5 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {selection ? selection.subtopic.title : "Math Concept Explorer"}
          </span>
        </header>

        <div className="hidden md:flex items-center justify-end px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400">
          {stats.done} / {stats.total} topics completed
        </div>

        <main className="flex-1 overflow-y-auto">
          {selection ? (
            <LessonPage
              grade={selection.grade}
              unit={selection.unit}
              subtopic={selection.subtopic}
              isCompleted={isCompleted(selection.subtopic.id)}
              onToggleCompleted={() => toggleCompleted(selection.subtopic.id)}
            />
          ) : (
            <EmptyState onBrowse={() => setMobileOpen(true)} />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="text-5xl mb-4">📐</div>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Welcome to Math Concept Explorer</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        Pick a grade, unit, and sub-topic from the sidebar to start a lesson — with explanations, worked examples,
        visuals, and practice questions.
      </p>
      <button
        onClick={onBrowse}
        className="md:hidden rounded-lg bg-indigo-500 text-white text-sm font-medium px-4 py-2"
      >
        Browse topics
      </button>
    </div>
  );
}
