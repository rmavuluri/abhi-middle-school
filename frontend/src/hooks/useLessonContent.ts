import { useEffect, useRef, useState } from "react";
import type { GradeData, LessonContent, Subtopic, Unit } from "../types";
import { fetchGeneratedContent } from "../utils/api";

const clientCache = new Map<string, LessonContent>();

export function useLessonContent(grade: GradeData | null, unit: Unit | null, subtopic: Subtopic | null) {
  const [content, setContent] = useState<LessonContent | null>(subtopic?.content ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!subtopic || !unit || !grade) return;

    if (subtopic.content) {
      setContent(subtopic.content);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = clientCache.get(subtopic.id);
    if (cached) {
      setContent(cached);
      setError(null);
      setLoading(false);
      return;
    }

    const myRequest = ++requestId.current;
    setContent(null);
    setLoading(true);
    setError(null);

    fetchGeneratedContent({
      subtopicId: subtopic.id,
      grade: grade.grade,
      unitTitle: unit.title,
      subtopicTitle: subtopic.title,
    })
      .then(({ content: generated }) => {
        if (requestId.current !== myRequest) return;
        clientCache.set(subtopic.id, generated);
        setContent(generated);
        setLoading(false);
      })
      .catch((err) => {
        if (requestId.current !== myRequest) return;
        setError(err.message || "Failed to generate content.");
        setLoading(false);
      });
  }, [grade, unit, subtopic]);

  const retry = () => {
    if (!subtopic) return;
    clientCache.delete(subtopic.id);
    setContent(null);
    setError(null);
    // trigger effect again by bumping request id and re-running fetch manually
    if (grade && unit && subtopic) {
      setLoading(true);
      fetchGeneratedContent({
        subtopicId: subtopic.id,
        grade: grade.grade,
        unitTitle: unit.title,
        subtopicTitle: subtopic.title,
      })
        .then(({ content: generated }) => {
          clientCache.set(subtopic.id, generated);
          setContent(generated);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to generate content.");
          setLoading(false);
        });
    }
  };

  return { content, loading, error, retry };
}
