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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (token) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // try {
        //   const fetchedUser = await api.getCurrentUser(); 
        //   setUser(fetchedUser);
        //   localStorage.setItem("user", JSON.stringify(fetchedUser));
        // } catch (err) {
        //   api.clearToken();
        //   setUser(null);
        // }
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const loggedInUser: User = {
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
    };
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    router.push("/");
  };

  const register = async (email: string, password: string, role: string) => {
    await api.register(email, password, role);
    await login(email, password);
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem("user");
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
