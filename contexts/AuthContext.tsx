"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin-token="));
    setIsLoggedIn(!!token);

    // Registro do Service Worker para PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registrado com sucesso:", reg.scope))
        .catch((err) => console.error("Falha ao registrar SW:", err));
    }
  }, []);

  const login = (password: string) => {
    if (password === "mario2026") {
      document.cookie = "admin-token=true; path=/; max-age=31536000"; // 1 ano
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    document.cookie = "admin-token=; path=/; max-age=0";
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
