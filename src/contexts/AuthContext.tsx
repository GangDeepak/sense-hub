import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "user" | "admin";

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const MOCK_USERS: { email: string; password: string; name: string; role: UserRole }[] = [
  { email: "admin@sense.com", password: "admin123", name: "Admin User", role: "admin" },
  { email: "user@sense.com", password: "user123", name: "Regular User", role: "user" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState(MOCK_USERS);

  const login = (email: string, password: string) => {
    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ email: found.email, name: found.name, role: found.role });
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const signup = (name: string, email: string, password: string, role: UserRole) => {
    const exists = registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: "Email already registered" };
    }
    const newUser = { email, password, name, role };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser({ email, name, role });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
