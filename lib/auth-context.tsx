"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = api.getToken();
    if (token) {
      // You might want to verify token validity here
      setUser({ id: "user-id", email: "user@example.com" }); // Simplified
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser({ id: response.user.id, email: response.user.email });
    router.push("/");
  };

  const register = async (email: string, password: string, role: string) => {
    await api.register(email, password, role);
    await login(email, password);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
