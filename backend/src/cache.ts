import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, "..", "data", "cache.json");

export interface CacheEntry {
  base?: unknown;
  alternates?: unknown[];
}

type CacheShape = Record<string, CacheEntry>;

function load(): CacheShape {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    return JSON.parse(raw) as CacheShape;
  } catch {
    return {};
  }
}

let cache: CacheShape = load();

function persist() {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export function getBase(subtopicId: string): unknown | undefined {
  return cache[subtopicId]?.base;
}

export function setBase(subtopicId: string, value: unknown) {
  cache[subtopicId] = { ...(cache[subtopicId] || {}), base: value };
  persist();
}

export function getAlternates(subtopicId: string): unknown[] {
  return cache[subtopicId]?.alternates || [];
}

export function addAlternate(subtopicId: string, value: unknown): number {
  const entry = cache[subtopicId] || {};
  const alternates = entry.alternates || [];
  alternates.push(value);
  cache[subtopicId] = { ...entry, alternates };
  persist();
  return alternates.length - 1;
}
