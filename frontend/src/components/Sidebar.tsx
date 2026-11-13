import { useMemo, useState } from "react";
import type { GradeData, Subtopic, Unit } from "../types";

interface SidebarProps {
  data: GradeData[];
  selectedId: string | null;
  onSelect: (grade: GradeData, unit: Unit, subtopic: Subtopic) => void;
  isCompleted: (id: string) => boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ data, selectedId, onSelect, isCompleted, mobileOpen, onCloseMobile }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return data;
    return data
      .map((grade) => ({
        ...grade,
        units: grade.units
          .map((unit) => ({
            ...unit,
            subtopics: unit.subtopics.filter((s) => s.title.toLowerCase().includes(query)),
          }))
          .filter((unit) => unit.subtopics.length > 0 || unit.title.toLowerCase().includes(query)),
      }))
      .filter((grade) => grade.units.length > 0);
  }, [data, query]);

  const toggleGrade = (id: string) => {
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const gradeOpen = (id: string) => (query ? true : expandedGrades.has(id));
  const unitOpen = (id: string) => (query ? true : expandedUnits.has(id));

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Math Concept Explorer</h1>
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && <p className="text-sm text-slate-400 px-3 py-4">No topics match "{search}".</p>}
        {filtered.map((grade) => (
          <div key={grade.id} className="mb-1">
            <button
              onClick={() => toggleGrade(grade.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>{grade.title}</span>
              <Chevron open={gradeOpen(grade.id)} />
            </button>
            {gradeOpen(grade.id) && (
              <div className="ml-2 border-l border-slate-200 dark:border-slate-700 pl-2">
                {grade.units.map((unit) => (
                  <div key={unit.id} className="mb-0.5">
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <span>{unit.title}</span>
                      <Chevron open={unitOpen(unit.id)} small />
                    </button>
                    {unitOpen(unit.id) && (
                      <div className="ml-2 border-l border-slate-200 dark:border-slate-700 pl-2">
                        {unit.subtopics.map((subtopic) => {
                          const active = subtopic.id === selectedId;
                          const done = isCompleted(subtopic.id);
                          return (
                            <button
                              key={subtopic.id}
                              onClick={() => {
                                onSelect(grade, unit, subtopic);
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                                active
                                  ? "bg-indigo-500 text-white"
                                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              <span
                                className={`inline-flex w-4 h-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                  done
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : active
                                    ? "border-white/70"
                                    : "border-slate-300 dark:border-slate-600"
                                }`}
                              >
                                {done ? "✓" : ""}
                              </span>
                              <span className="truncate">{subtopic.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-full">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function Chevron({ open, small }: { open: boolean; small?: boolean }) {
  return (
    <svg
      className={`shrink-0 transition-transform ${open ? "rotate-90" : ""} ${small ? "w-3.5 h-3.5" : "w-4 h-4"} text-slate-400`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
