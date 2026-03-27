export const BASE_URL = "http://127.0.0.1:8000";

export const QUERY_COLLECTIONS = ["query_memory", "query_memory_dev", "query_memory_prod"];
export const KNOWLEDGE_COLLECTIONS = ["knowledge_memory", "knowledge_memory_dev", "knowledge_memory_prod"];

export interface QueryRecord {
  _doc_id?: string;
  user_query?: string;
  query_uuid?: string;
  cluster_id?: string;
  intent_tags?: string[];
  knowledge_ids?: string[];
  knowledge?: { type: string; description: string }[];
  [key: string]: unknown;
}

export interface KnowledgeRecord {
  _doc_id?: string;
  knowledge_id?: string;
  name?: string;
  short_description?: string;
  description?: string;
  type?: string;
  api_tags?: string[];
  keywords?: string[];
  search_keywords?: string[][];
  version?: string;
  tenant_id?: string;
  app_id?: string;
  [key: string]: unknown;
}

export function normalise(item: any): any {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    if (item.payload && typeof item.payload === "object") {
      return { _doc_id: item.id, ...item.payload };
    }
    const values = Object.values(item);
    if (values.length === 1 && typeof values[0] === "object" && values[0] !== null) {
      return values[0];
    }
  }
  return item;
}

export function countItems<T>(arr: T[]): Record<string, number> {
  return arr.reduce((m: Record<string, number>, v) => {
    const key = String(v);
    m[key] = (m[key] || 0) + 1;
    return m;
  }, {});
}

export function escHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function hlText(str: string, q: string): string {
  if (!q) return str;
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = str.split(new RegExp(`(${safeQ})`, "gi"));
  return parts
    .map((part) =>
      part.toLowerCase() === q.toLowerCase()
        ? `<mark>${escHtml(part)}</mark>`
        : escHtml(part)
    )
    .join("");
}

export function syntaxJson(val: unknown): string {
  return JSON.stringify(val, null, 2)
    .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-blue-300">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-green-400">$1</span>')
    .replace(/: null/g, ': <span class="text-muted-foreground">null</span>');
}
