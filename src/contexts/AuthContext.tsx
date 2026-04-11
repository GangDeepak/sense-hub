import { createContext, useContext, useEffect, useState, ReactNode } from "react";

import { clearAccessToken, getAccessToken, getAuthHeaders, setAccessToken } from "@/utils/token";

export type UserRole = "user" | "admin";

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  edit_access?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type MeJwtPayload = {
  sub: string; // user email
  role: UserRole;
  exp?: number;
};

async function fetchMe(): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch /auth/me (${res.status})`);
  }

  const json = (await res.json()) as { message?: string; user?: MeJwtPayload };
  const payload = json.user;
  if (!payload?.sub || !payload.role) throw new Error("Invalid /auth/me response");

  const name = payload.sub.includes("@") ? payload.sub.split("@")[0] : payload.sub;
  const edit_access = localStorage.getItem("sense_edit_access") === "true";
  return { email: payload.sub, name, role: payload.role, edit_access };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        clearAccessToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login: AuthContextType["login"] = async (email, password, role) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, error: text || "Login failed" };
      }

      const json = (await res.json()) as { access_token?: string; token_type?: string; edit_access?: boolean };
      const token = json.access_token;
      if (!token) return { success: false, error: "Missing access token" };

      setAccessToken(token);
      localStorage.setItem("sense_edit_access", String(!!json.edit_access));
      const me = await fetchMe();
      setUser(me);
      return { success: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAccessToken();
    localStorage.removeItem("sense_edit_access");
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
