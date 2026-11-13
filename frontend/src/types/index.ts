export interface PracticeQuestion {
  prompt: string;
  choices?: string[];
  answer: string;
  hint: string;
}

export interface WorkedExample {
  steps: string[];
}

export type VisualSpec = {
  type:
    | "shape"
    | "tape"
    | "percent-grid"
    | "fraction-bars"
    | "number-line"
    | "coordinate-plane"
    | "circle"
    | "angle"
    | "solid"
    | "pythagoras"
    | "dot-plot"
    | "none";
  props?: Record<string, any>;
};

export interface LessonContent {
  explanation: string;
  example: WorkedExample;
  visual?: VisualSpec;
  practice: PracticeQuestion[];
}

export interface Subtopic {
  id: string;
  title: string;
  videoUrl: string;
  generated: boolean;
  content: LessonContent | null;
}

export interface Unit {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export interface GradeData {
  id: string;
  grade: number;
  title: string;
  units: Unit[];
}

export interface AlternateExplanation {
  explanation: string;
  example: WorkedExample;
}
