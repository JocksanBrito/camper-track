"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Autenticação
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. Verificação de Tripulação (Blindada)
        const { data: crewData, error: crewError } = await supabase
          .from("tripulacao")
          .select("status")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (crewError) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Erro técnico na tabela tripulacao:", crewError.message);
          }
        }

        // 3. Bloqueio de Pendentes
        if (crewData?.status === "pendente") {
          setError("Sua conta aguarda aprovação do Comandante.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      }

      // 4. Sucesso: Setar cookie e redirecionar
      document.cookie = "admin-token=true; path=/; max-age=31536000";
      
      router.refresh();
      router.push("/");
      
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erro fatal no Login:", err);
      }
      setError("Erro de conexão. Verifique os serviços.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex justify-start mb-4">
        <Link
          href="/"
          className="game-button bg-zinc-800 text-white text-xs py-2 px-3 flex items-center gap-1.5"
        >
          Voltar
        </Link>
      </div>
      
      <form
        onSubmit={handleLogin}
        className="glass-panel p-6 rounded-2xl game-border-red flex flex-col gap-4 max-w-sm w-full"
      >
        <h1 className="text-2xl font-black uppercase tracking-tighter text-center">
          Entrar na Corrida
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 text-xs p-2 rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-zinc-400">E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white font-bold outline-none focus:border-[var(--mario-red)]"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-zinc-400">Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white font-bold outline-none focus:border-[var(--mario-red)]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="game-button bg-[var(--mario-red)] text-white w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processando..." : "Iniciar"}
        </button>

        <p className="text-center text-xs font-bold text-zinc-400 mt-2">
          Não tem conta?{" "}
          <Link href="/signup" className="text-[var(--mario-blue)] underline hover:text-blue-400">
            Aliste-se aqui
          </Link>
        </p>
      </form>
    </div>
  );
}