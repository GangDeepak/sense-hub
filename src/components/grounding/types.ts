import { getAuthHeaders } from "@/utils/token";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const QUERY_COLLECTIONS = ["query_memory", "query_memory_dev", "query_memory_prod"];
export const KNOWLEDGE_COLLECTIONS = ["knowledge_memory", "knowledge_memory_dev", "knowledge_memory_prod"];

// Collections where edit/insert is allowed
export const EDITABLE_COLLECTIONS = [
  "query_memory",
  "query_memory_dev",
  "knowledge_memory",
  "knowledge_memory_dev",
];

export function isEditable(collection: string): boolean {
  return EDITABLE_COLLECTIONS.includes(collection);
}

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

// ── API helpers ──────────────────────────────────────────────────────────────

export async function apiUpdatePoint(
  collection: string,
  pointId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${BASE_URL}/grounding/point/${collection}/${pointId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ payload }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Update failed (${res.status}): ${text}`);
  }
}

export async function apiDeletePoint(collection: string, pointId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/grounding/point/${collection}/${pointId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Delete failed (${res.status}): ${text}`);
  }
}

export async function apiInsert(
  collection: string,
  data: Record<string, unknown>[],
  textKey: string
): Promise<number> {
  const res = await fetch(`${BASE_URL}/grounding/insert`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ collection_name: collection, data, text_key: textKey }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Insert failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.inserted_count ?? 0;
}

// ── Misc helpers ──────────────────────────────────────────────────────────────

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
