"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "ADMIN" | "CASHIER" | "OPTOMETRIST";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock session loading
    const loadSession = () => {
      const storedUser = localStorage.getItem("optics_session");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    
    // Slight delay to mock network request
    const timer = setTimeout(loadSession, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string) => {
    // Mock login logic
    const mockUser: User = {
      id: "usr_123",
      name: "Demo Admin",
      email: email,
      role: "ADMIN" // hardcoded mock role
    };
    localStorage.setItem("optics_session", JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem("optics_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
