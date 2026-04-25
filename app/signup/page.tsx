"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "viewer",
          },
        },
      });

      if (error) {
        toast.error(`Erro no cadastro: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data?.user) {
        await supabase.from("tripulacao").insert({
          user_id: data.user.id,
          nome: name,
          status: "pendente",
        });
      }

      toast.success(
        "Alistamento recebido! Aguarde a aprovação do Comandante Jocksan para embarcar. 🚐💨"
      );
      router.push("/login");
    } catch (err: any) {
      toast.error("Erro ao conectar com o servidor.");
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
        onSubmit={handleSignUp}
        className="glass-panel p-6 rounded-2xl game-border-red flex flex-col gap-4 max-w-sm w-full"
      >
        <h1 className="text-2xl font-black uppercase tracking-tighter text-center text-[var(--mario-yellow)]">
          Novo Tripulante
        </h1>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-zinc-400">
            Nome
          </label>
          <input
            type="text"
            placeholder="Seu Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white font-bold"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-zinc-400">
            E-mail
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white font-bold"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase text-zinc-400">
            Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white font-bold"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="game-button bg-[var(--mario-red)] text-white w-full mt-2 disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Alistar-se"}
        </button>

        <p className="text-center text-xs font-bold text-zinc-400 mt-2">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-[var(--mario-blue)] underline hover:text-blue-400"
          >
            Fazer Login
          </Link>
        </p>
      </form>
    </div>
  );
}
