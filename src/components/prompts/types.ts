import { getAuthHeaders } from "@/utils/token";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface Prompt {
  _id: string;
  tenant_id?: string;
  app_id?: string;
  engine_type?: string;
  name: string;
  version?: string;
  model_name?: string;
  max_tokens?: number;
  system_prompt: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export async function fetchPrompts(): Promise<Prompt[]> {
  const res = await fetch(`${BASE_URL}/prompts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to fetch prompts (${res.status}): ${text}`);
  }
  const data = await res.json();
  // Based on backend: { "count": X, "prompts": [...] }
  return data.prompts || [];
}

export async function updatePrompt(id: string, payload: Partial<Prompt>): Promise<Prompt> {
  const res = await fetch(`${BASE_URL}/prompts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Update prompt failed (${res.status}): ${text}`);
  }
  return await res.json();
}

export async function deletePrompt(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/prompts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Delete prompt failed (${res.status}): ${text}`);
  }
}

export async function createPrompt(payload: Partial<Prompt>): Promise<Prompt> {
  const res = await fetch(`${BASE_URL}/prompts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Create prompt failed (${res.status}): ${text}`);
  }
  return await res.json();
}
