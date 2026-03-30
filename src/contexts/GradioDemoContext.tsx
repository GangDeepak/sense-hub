import { createContext, useContext, useState, ReactNode } from "react";

export interface InsuredItem {
  ref_id: string;
  insured_name: string;
}

export const INSURED_LIST: InsuredItem[] = [
  { ref_id: "2907133a-b9a6-4dfd-8950-7d3dae3d269a", insured_name: "PHI Group, Inc." },
  { ref_id: "fe894b24-c655-4345-ab14-3ce82af80ded", insured_name: "Windsor Parke Professional Centre Association Inc." },
  { ref_id: "5cbc9806-7165-47ec-a134-e0d83509dd34", insured_name: "King & Queen Company" },
  { ref_id: "0193da15-ffbc-4ad9-9865-c18b7d253b43", insured_name: "DAL Realty Management, LLC" },
  { ref_id: "b7d68cc5-a478-46f0-8395-c4b5efb64dd7", insured_name: "Regional Investment and Management" },
  { ref_id: "4378e5cb-76e4-4c17-89d6-012e0aec370b", insured_name: "Gary Mehan Paint and Body Inc" },
  { ref_id: "c1b22189-682e-4f56-bcc6-aed5c84c2747", insured_name: "Marine Terrace Association, Inc." },
];

interface GradioDemoContextType {
  selectedInsured: InsuredItem | null;
  setSelectedInsured: (item: InsuredItem | null) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  sessions: { session_uuid: string; created_at?: string; session_name?: string; version?: string }[];
  setSessions: (s: { session_uuid: string; created_at?: string; session_name?: string; version?: string }[]) => void;
  updateSessionName: (sessionId: string, name: string) => void;
}

const GradioDemoContext = createContext<GradioDemoContextType | undefined>(undefined);

export function GradioDemoProvider({ children }: { children: ReactNode }) {
  const [selectedInsured, setSelectedInsured] = useState<InsuredItem | null>(null);
  const [sessionId, setSessionId] = useState("default_session");
  const [sessions, setSessions] = useState<{ session_uuid: string; created_at?: string }[]>([]);

  return (
    <GradioDemoContext.Provider
      value={{ selectedInsured, setSelectedInsured, sessionId, setSessionId, sessions, setSessions }}
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
