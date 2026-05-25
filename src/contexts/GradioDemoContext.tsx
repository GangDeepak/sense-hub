import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface InsuredItem {
  ref_id: string;
  insured_name: string;
  account_number?: string;
  policy_number?: string;
}

export const DEFAULT_INSURED: InsuredItem = { ref_id: "landing_page", insured_name: "Landing Page" };


interface GradioDemoContextType {
  selectedInsured: InsuredItem | null;
  setSelectedInsured: (item: InsuredItem | null) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  sessions: { session_uuid: string; created_at?: string; session_name?: string; version?: string }[];
  setSessions: (s: { session_uuid: string; created_at?: string; session_name?: string; version?: string }[]) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  referenceQueries: any[];
  insuredList: InsuredItem[];
  isLoadingInsureds: boolean;
}

const GradioDemoContext = createContext<GradioDemoContextType | undefined>(undefined);

export function GradioDemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedInsured, setSelectedInsured] = useState<InsuredItem | null>(null);
  const [sessionId, setSessionId] = useState("default_session");
  const [sessions, setSessions] = useState<{ session_uuid: string; created_at?: string; session_name?: string; version?: string }[]>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [referenceQueries, setReferenceQueries] = useState<any[]>([]);
  const [insuredList, setInsuredList] = useState<InsuredItem[]>([DEFAULT_INSURED]);
  const [isLoadingInsureds, setIsLoadingInsureds] = useState(false);

  const fetchInsuredList = async () => {
    setIsLoadingInsureds(true);
    try {
      const today = new Date();
      const start = new Date(today);
      start.setFullYear(today.getFullYear() - 1);
      const end = new Date(today);
      end.setFullYear(today.getFullYear() + 1);

      const formatDate = (date: Date) => {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      };

      const eff_start = formatDate(start);
      const eff_end = formatDate(end);

      const url = `/proxy/suw-dev/api/v1/all-account?eff_start=${encodeURIComponent(eff_start)}&eff_end=${encodeURIComponent(eff_end)}&page=0`;

      const res = await fetch(url, {
        headers: {
          "tenant-id": "3f49c8a9-79d4-4d51-9e72-88f7f654c3a6",
          "app-id": "suw-dev",
          "email-id": "deepak.gangwar@bluepond.ai"
        }
      });

      if (!res.ok) throw new Error("Failed to fetch insured list");

      const data = await res.json();
      const results = data.data?.results || [];

      // Deduplicate by txn_id to prevent duplicate React keys
      const seenIds = new Set<string>();
      const uniqueResults = results.filter((item: any) => {
        if (!item.txn_id || seenIds.has(item.txn_id)) return false;
        seenIds.add(item.txn_id);
        return true;
      });

      const mapped: InsuredItem[] = uniqueResults
        .filter((item: any) => item.insured_name)
        .map((item: any) => ({
          ref_id: item.txn_id,
          insured_name: item.insured_name,
          account_number: item.account_number,
          policy_number: item.policy_number,
        }));

      setInsuredList([DEFAULT_INSURED, ...mapped]);
    } catch (err) {
      console.error("Error fetching insured list:", err);
    } finally {
      setIsLoadingInsureds(false);
    }
  };

  const fetchReferenceQueries = async () => {
    try {
      console.log(`[GradioDemoContext] Fetching reference queries from: ${API_BASE}/grounding/all_query/query_memory?with_vectors=false`);
      const res = await fetch(`${API_BASE}/grounding/all_query/query_memory_test?with_vectors=false`);
      if (!res.ok) {
        console.error(`[GradioDemoContext] Failed to fetch reference queries: ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json();
      console.log("[GradioDemoContext] Raw reference queries data:", data);

      // API returns: { status, collection_name, count, queries: string[] }
      // Normalise to objects with a `user_query` field so the suggestion
      // matcher in GradioDemo can find them via q.user_query.
      const rawQueries: any[] = Array.isArray(data)
        ? data
        : (data.queries || data.points || []);

      const normalized = rawQueries.map((item: any) => {
        // Already an object with payload (Qdrant-style)
        if (item && typeof item === "object" && item.payload) {
          return { ...item.payload, _doc_id: item.id };
        }
        // Plain string — wrap it
        if (typeof item === "string") {
          return { user_query: item };
        }
        return item;
      });

      setReferenceQueries(normalized);
    } catch (err) {
      console.error("Failed to fetch reference queries:", err);
    }
  };


  useEffect(() => {
    fetchReferenceQueries();
    fetchInsuredList();
  }, []);

  useEffect(() => {
    if (referenceQueries.length > 0) {
      console.log(`[GradioDemoContext] Successfully fetched ${referenceQueries.length} reference queries.`);
    }
  }, [referenceQueries]);

  const updateSessionName = (sid: string, name: string) => {
    const trimmed = name.slice(0, 50);
    setSessions((prev) => prev.map((s) => (s.session_uuid === sid ? { ...s, session_name: trimmed } : s)));

    // Persist session name update in backend (fire-and-forget).
    void (async () => {
      try {
        if (!sid || sid === "default_session") return;
        const emailStr = encodeURIComponent(user?.email || "default_email");
        await fetch(`${API_BASE}/gradio_demo/session/${sid}?email=${emailStr}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_name: trimmed }),
        });
      } catch {
        // ignore network failures; UI already updated locally.
      }
    })();
  };

  return (
    <GradioDemoContext.Provider
      value={{
        selectedInsured,
        setSelectedInsured,
        sessionId,
        setSessionId,
        sessions,
        setSessions,
        updateSessionName,
        referenceQueries,
        insuredList,
        isLoadingInsureds
      }}
    >
      {children}
    </GradioDemoContext.Provider>
  );
}

export function useGradioDemo() {
  const ctx = useContext(GradioDemoContext);
  if (!ctx) throw new Error("useGradioDemo must be used within GradioDemoProvider");
  return ctx;
}
