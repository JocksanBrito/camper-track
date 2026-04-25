"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      router.push("/admin");
    } else {
      alert("Senha incorreta!");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="glass-panel p-6 rounded-2xl game-border-red flex flex-col gap-4 max-w-sm w-full"
      >
        <h1 className="text-2xl font-black uppercase tracking-tighter text-center">
          Admin Login
        </h1>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-center font-bold"
        />
        <button
          type="submit"
          className="game-button bg-[var(--mario-red)] text-white w-full"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
