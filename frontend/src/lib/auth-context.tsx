"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchClient } from "@/lib/api-client";

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
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = () => {
      const storedSession = localStorage.getItem("optics_session");
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
            localStorage.removeItem("optics_session");
            if (window.location.pathname !== "/login") {
              window.location.href = "/login?expired=true";
            }
          } else if (parsed.user) {
            setUser(parsed.user);
          }
        } catch (error) {
          console.error("Failed to parse session data", error);
          localStorage.removeItem("optics_session");
        }
      }
      setIsLoading(false);
    };
    
    loadSession();
  }, []);

  const login = async (email: string, password?: string, rememberMe?: boolean) => {
    try {
      // Default fallback password for development if not provided
      const pwd = password || "123456";
      
      const response = await fetchClient<{ success: boolean; data: { token: string, user: User } }>("/auth/login", {
        data: { email, password: pwd }
      });

      const expiresAt = Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;

      const sessionData = {
        token: response.data.token,
        user: response.data.user,
        expiresAt
      };
      
      localStorage.setItem("optics_session", JSON.stringify(sessionData));
      setUser(response.data.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("optics_session");
    setUser(null);
    window.location.href = "/login";
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
