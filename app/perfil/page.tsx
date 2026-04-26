"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, User, Shield, LogOut, Save, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || "");

        const { data: prof } = await supabase
          .from("tripulacao")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (prof) {
          setProfile(prof);
          setNome(prof.nome || "");
          setAvatarUrl(prof.foto_url || "");
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("Você deve selecionar uma imagem.");
      }



      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      
      // Atualizar a tabela tripulacao imediatamente
      const { data: updateData, error: updateError } = await supabase
        .from("tripulacao")
        .update({ foto_url: data.publicUrl })
        .eq('user_id', user.id)
        .select();
      


      if (updateError) throw updateError;
      toast.success("Foto de perfil atualizada!");

      // Refresh local state
      const { data: updatedProf } = await supabase
        .from("tripulacao")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(updatedProf);
    } catch (error: any) {
      console.error("Erro no Upload de Foto:", error);
      toast.error(error.message || "Erro no upload. Verifique as políticas de RLS.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 1. Update Auth Email/Password
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("Confirme o novo email na sua caixa de entrada.");
      }

      if (password) {
        const { error: passError } = await supabase.auth.updateUser({ password });
        if (passError) throw passError;
        toast.success("Senha alterada com sucesso!");
        setPassword("");
      }

      // 2. Update Tripulacao
      const payload = {
        nome,
        foto_url: avatarUrl,
        funcao_missao: profile?.funcao_missao || 'passageiro',
      };
      
      const { data: updateData, error: profError } = await supabase
        .from("tripulacao")
        .update(payload)
        .eq('user_id', user.id)
        .select();

      if (profError) throw profError;

      toast.success("Perfil atualizado!");
      
      // Refresh local state
      const { data: updatedProf } = await supabase
        .from("tripulacao")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(updatedProf);
    } catch (error: any) {
      console.error("Erro ao Salvar Perfil:", error);
      toast.error(error.message || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Sessão encerrada.");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-bold uppercase text-xs">
        Carregando...
      </div>
    );
  }

  // View para NÃO LOGADOS (Espectadores)
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-4 pb-24">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/40 text-center flex flex-col gap-6">
          <div className="bg-[var(--mario-yellow)] text-black font-black text-xl p-3 rounded-xl border-2 border-black shadow-md inline-block mx-auto transform -rotate-2">
            BEM-VINDO, ESPECTADOR!
          </div>
          <p className="text-zinc-400 font-bold text-sm leading-relaxed">
            Você está acompanhando a jornada da Camper Elevan 1986. Quer se juntar à tripulação oficial?
          </p>
          <div className="flex flex-col gap-3 mt-4">
            <Link href="/login" className="game-button bg-[var(--mario-blue)] text-white font-black py-3 text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Fazer Login
            </Link>
            <Link href="/signup" className="game-button bg-[var(--mario-green)] text-white font-black py-3 text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Recrutar-se (Criar Conta)
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 md:p-8 pb-24">
      <header className="w-full max-w-4xl flex justify-between items-center border-b-2 border-zinc-800 pb-4 mb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black italic tracking-tighter text-[var(--mario-green)]">PERFIL DO TRIPULANTE</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Gestão de Conta</p>
        </div>
        <Link href="/" className="game-button bg-zinc-800 px-4 py-2 text-xs font-bold flex items-center gap-1">
          <ArrowLeft size={16} /> VOLTAR
        </Link>
      </header>

      <main className="w-full max-w-md glass-panel p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 bg-zinc-900/40">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-2 border-b-2 border-zinc-800 pb-4">
            <div className="relative w-24 h-24 bg-zinc-800 rounded-full border-4 border-black overflow-hidden shadow-lg flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-zinc-600" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            <label className="game-button bg-zinc-800 px-3 py-1 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer">
              <Upload size={12} /> {uploading ? "Carregando..." : "Alterar Foto"}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          {/* Role/Funcao Badge */}
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800 text-xs">
            <span className="font-bold text-zinc-500 uppercase">Status</span>
            <div className="flex gap-2">
              <span className="font-black uppercase text-[var(--mario-yellow)] flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-700">
                <Shield size={10} /> {profile?.role || "Usuário"}
              </span>
              <span className="font-black uppercase text-green-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-700">
                {profile?.funcao_missao || "Passageiro"}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nome</label>
            <input 
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required
              className="bg-zinc-900 p-3 rounded-xl border-2 border-zinc-800 font-bold text-sm focus:border-[var(--game-border)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="bg-zinc-900 p-3 rounded-xl border-2 border-zinc-800 font-bold text-sm focus:border-[var(--game-border)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nova Senha (Opcional)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Digite para alterar"
              className="bg-zinc-900 p-3 rounded-xl border-2 border-zinc-800 font-bold text-sm focus:border-[var(--game-border)] focus:outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="game-button bg-[var(--mario-green)] text-white font-black py-3 text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2"
          >
            <Save size={16} /> Salvar Alterações
          </button>
        </form>

        <button onClick={handleLogout} className="game-button bg-[var(--mario-red)] text-white font-black py-3 text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <LogOut size={16} /> Encerrar Sessão
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
