"use client";

import { useState, useEffect } from "react";
import { Camera, ArrowLeft, Upload, MapPin, Folder, Trash2, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function DiarioDeBordo() {
  const { isLoggedIn } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [legenda, setLegenda] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [parentCatId, setParentCatId] = useState<string>("");
  const [selectedCountryId, setSelectedCountryId] = useState("Todos");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [selectedCategoriaId, setSelectedCategoriaId] = useState("Todos");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const [uploading, setUploading] = useState(false);

  // Estados v2.0
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatNome, setNewCatNome] = useState("");
  const [activePhoto, setActivePhoto] = useState<any | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [editLegenda, setEditLegenda] = useState("");
  const [editLocalizacao, setEditLocalizacao] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [userRole, setUserRole] = useState<string>("");
  const [userFuncao, setUserFuncao] = useState<string>("");

  const canManage = isLoggedIn && (userRole === "admin" || userFuncao === "copiloto");

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("tripulacao")
          .select("role, funcao_missao")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (prof) {
          setUserRole(prof.role || "usuario");
          setUserFuncao(prof.funcao_missao || "passageiro");
        }
      } else {
        setUserRole("");
        setUserFuncao("");
      }
    } catch (error) {
      console.error("Erro ao buscar role:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("diario_categorias")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
      
      // Se não houver categoria selecionada no upload, tenta pegar a primeira disponível
      if (!categoriaId && data && data.length > 0) {
        const firstCity = data.find(c => c.parent_id !== null);
        if (firstCity) setCategoriaId(firstCity.id);
        else setCategoriaId(data[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("diario_bordo")
        .select("*");

      if (selectedCategoriaId !== "Todos") {
        query = query.eq("categoria_id", selectedCategoriaId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar fotos:", error);
      toast.error("Erro ao carregar o Diário.");
    } finally {
      setLoading(false);
    }
  };

  // Busca inicial: Role e Categorias (Apenas uma vez)
  useEffect(() => {
    fetchUserRole();
    fetchCategorias();
  }, [isLoggedIn]);

  // Busca de Fotos: Sempre que trocar o filtro
  useEffect(() => {
    setPhotos([]);
    fetchPhotos();
    setSelectedCity("Todas"); // Reseta a cidade ao trocar o álbum principal
  }, [selectedCategoriaId]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return toast.error("Selecione pelo menos uma imagem!");

    try {
      setUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const fileExt = currentFile.name.split(".").pop();
        const filePath = `diario-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("galeria")
          .upload(filePath, currentFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from("diario_bordo")
          .insert({
            foto_url: urlData.publicUrl,
            legenda: files.length > 1 ? `${legenda} (${i + 1}/${files.length})` : legenda,
            localizacao,
            categoria_id: categoriaId || null,
          });

        if (insertError) throw insertError;
      }

      toast.success(files.length > 1 ? `${files.length} fotos registradas!` : "Momento registrado!");
      setLegenda("");
      setLocalizacao("");
      setFiles([]);
      setUploadProgress(null);
      
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      fetchPhotos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao publicar.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNome.trim()) return;
    
    try {
      const slug = newCatNome.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const { error } = await supabase
        .from("diario_categorias")
        .insert({ 
          nome: newCatNome.trim(), 
          slug,
          parent_id: parentCatId || null 
        });
      
      if (error) throw error;
      toast.success("Álbum adicionado!");
      setNewCatNome("");
      setParentCatId("");
      fetchCategorias();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar álbum.");
    }
  };

  const handleDeleteCategory = async (id: string, nome: string) => {
    if (nome === "Geral") return toast.error("A categoria Geral não pode ser excluída.");
    if (!confirm(`Tem certeza que deseja excluir a categoria "${nome}"? Todas as fotos nela serão movidas para "Geral".`)) return;
    
    try {
      const geralCat = categorias.find(c => c.nome === "Geral");
      if (geralCat) {
        await supabase
          .from("diario_bordo")
          .update({ categoria_id: geralCat.id })
          .eq("categoria_id", id);
      }

      const { error } = await supabase
        .from("diario_categorias")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Categoria excluída!");
      fetchCategorias();
      fetchPhotos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir categoria.");
    }
  };

  const handleEditPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    
    try {
      const { error } = await supabase
        .from("diario_bordo")
        .update({
          legenda: editLegenda,
          localizacao: editLocalizacao,
          categoria_id: editCategoriaId
        })
        .eq("id", editingPhoto.id);
      
      if (error) throw error;
      toast.success("Post atualizado!");
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar post.");
    }
  };

  const handleNextPhoto = () => {
    if (!activePhoto || filteredPhotos.length < 2) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!activePhoto || filteredPhotos.length < 2) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[prevIndex]);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;
    
    try {
      const slug = editCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const { error } = await supabase
        .from("diario_categorias")
        .update({ nome: editCategoryName.trim(), slug })
        .eq("id", editingCategory.id);
      
      if (error) throw error;
      toast.success("Álbum renomeado!");
      setEditingCategory(null);
      fetchCategorias();
      fetchPhotos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao renomear álbum.");
    }
  };

  const handleDeletePhoto = async (photo: any) => {
    if (!confirm("Tem certeza que deseja excluir esta foto?")) return;
    
    try {
      const { error } = await supabase
        .from("diario_bordo")
        .delete()
        .eq("id", photo.id);
      
      if (error) throw error;

      const urlParts = photo.foto_url.split("/");
      const filePath = urlParts[urlParts.length - 1];
      
      if (filePath) {
        await supabase.storage.from("galeria").remove([filePath]);
      }

      toast.success("Foto excluída!");
      if (activePhoto && activePhoto.id === photo.id) {
        setActivePhoto(null);
      }
      fetchPhotos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir foto.");
    }
  };

  // Lógica de Filtro Dinâmico por Cidade (Localização)
  const uniqueCities = Array.from(new Set(photos.map(p => p.localizacao).filter(Boolean)));
  const filteredPhotos = selectedCity === "Todas" 
    ? photos 
    : photos.filter(p => p.localizacao === selectedCity);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-4 pt-12 pb-24 gap-6">
      {/* Botão Voltar */}
      <div className="w-full max-w-md md:max-w-4xl flex justify-start">
        <Link
          href="/"
          className="game-button bg-zinc-800 text-white text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Voltar para o Mapa
        </Link>
      </div>

      <main className="w-full max-w-md md:max-w-4xl flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Camera
            size={48}
            className="text-[var(--mario-red)] animate-bounce"
          />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--mario-yellow)]">
            Diário de Bordo
          </h1>
          <p className="text-xs text-zinc-400">
            Momentos capturados na nossa expedição
          </p>
        </div>

        {/* Filtros de Álbum (Países) e Cidades Dinâmicas */}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
            <button
              onClick={() => setSelectedCategoriaId("Todos")}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border-2 transition-all ${
                selectedCategoriaId === "Todos"
                  ? "bg-[var(--mario-yellow)] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              Todos os Países
            </button>
            {categorias.filter(cat => cat.nome !== "Geral").map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoriaId(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border-2 transition-all ${
                  selectedCategoriaId === cat.id
                    ? "bg-[var(--mario-yellow)] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>

          {/* Sub-filtros Automáticos (Carrossel Horizontal Mobile-First) */}
          {uniqueCities.length > 0 && (
            <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
              <div className="flex flex-nowrap gap-2 mx-auto">
                <button
                  onClick={() => setSelectedCity("Todas")}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border-2 transition-all ${
                    selectedCity === "Todas"
                      ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  Todas as Cidades
                </button>
                {uniqueCities.map((city: any) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border-2 transition-all ${
                      selectedCity === city
                        ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Gerenciar Álbuns (Apenas se canManage) */}
        {isLoggedIn && canManage && (
          <button
            onClick={() => setIsManageCatsOpen(true)}
            className="game-button bg-zinc-800 text-white text-[10px] py-1 px-3 flex items-center gap-1 font-bold"
          >
            <Folder size={12} /> Gerenciar Álbuns
          </button>
        )}

        {/* Formulário de Postagem (Apenas Admin/Copiloto) */}
        {isLoggedIn && canManage && (
          <form className="w-full glass-panel p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/50 flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Upload size={16} /> Novo Registro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">
                  Foto
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="text-xs text-zinc-400 bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl w-full font-bold"
                />
                {files.length > 0 && (
                  <span className="text-[9px] text-[var(--mario-green)] font-bold mt-1 uppercase">
                    {files.length} {files.length === 1 ? "foto selecionada" : "fotos selecionadas"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">
                  Álbum
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold w-full h-[38px]"
                >
                  {categorias.filter(cat => cat.nome !== "Geral").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Localização
              </label>
              <div className="relative flex items-center">
                <MapPin size={14} className="absolute left-3 text-zinc-500" />
                <input
                  type="text"
                  list="city-suggestions"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Onde essa foto foi tirada?"
                  className="bg-zinc-800 border-2 border-zinc-700 p-2 pl-9 rounded-xl text-white text-xs font-bold w-full"
                />
                <datalist id="city-suggestions">
                  {uniqueCities.map((city: any) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Legenda
              </label>
              <textarea
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Como foi esse momento?"
                className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold h-16 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={uploading}
              className={`game-button bg-[var(--mario-green)] text-white w-full text-xs mt-1 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading 
                ? `Enviando (${uploadProgress?.current}/${uploadProgress?.total})...` 
                : files.length > 1 ? `Publicar ${files.length} Fotos` : "Publicar no Diário"}
            </button>
          </form>
        )}

        {/* Galeria */}
        {loading ? (
          <div className="text-zinc-500 font-bold text-xs animate-pulse mt-8">
            CARREGANDO DIÁRIO...
          </div>
        ) : photos.length === 0 ? (
          <div className="text-zinc-600 font-bold text-xs mt-8 uppercase italic flex flex-col items-center gap-2">
            <Folder size={32} className="text-zinc-800" />
            Nenhum registro nesta região ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {filteredPhotos.map((photo) => {
              const catNome = categorias.find(c => c.id === photo.categoria_id)?.nome || "Geral";
              return (
                <div
                  key={photo.id}
                  className="glass-panel p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-800/50 flex flex-col gap-2"
                >
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-black bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.foto_url}
                      alt={photo.legenda || "Foto do Diário"}
                      onClick={() => setActivePhoto(photo)}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                    />
                    {photo.localizacao && (
                      <span className="absolute bottom-2 left-2 text-[8px] bg-zinc-900/80 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border border-zinc-700">
                        <MapPin size={8} /> {photo.localizacao}
                      </span>
                    )}
                    <span className="absolute top-2 right-2 text-[8px] bg-[var(--mario-yellow)] text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {catNome}
                    </span>
                  </div>
                  {photo.legenda && (
                    <p className="text-sm font-bold text-left text-zinc-100 mt-1">
                      {photo.legenda}
                    </p>
                  )}
                  <span className="text-[10px] font-medium text-left text-zinc-400 mt-auto pt-2 border-t border-zinc-800/50 flex justify-between items-center">
                    <span>{new Date(photo.created_at).toLocaleDateString("pt-BR")}</span>
                    <div className="flex gap-1">
                      {isLoggedIn && canManage && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPhoto(photo);
                              setEditLegenda(photo.legenda || "");
                              setEditLocalizacao(photo.localizacao || "");
                              
                              const visibleCats = categorias.filter(c => c.nome !== "Geral");
                              const isGeral = !photo.categoria_id || categorias.find(c => c.id === photo.categoria_id)?.nome === "Geral";
                              if (isGeral && visibleCats.length > 0) {
                                setEditCategoriaId(visibleCats[0].id);
                              } else {
                                setEditCategoriaId(photo.categoria_id || "");
                              }
                            }}
                            className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-0.5 rounded font-bold uppercase border border-zinc-700 flex items-center gap-1"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(photo)}
                            className="text-[10px] bg-red-600/80 hover:bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase border border-black flex items-center gap-1"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-zinc-900 border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {/* Contador de Fotos */}
            <div className="absolute top-4 left-4 z-[60] bg-black/60 text-white px-3 py-1 text-[10px] font-black rounded-full border-2 border-white/50">
              {filteredPhotos.findIndex(p => p.id === activePhoto.id) + 1} DE {filteredPhotos.length}
            </div>
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white px-3 py-1 text-xs font-black rounded-full border-2 border-white z-[60] transition-all"
            >
              FECHAR
            </button>

            {/* Setas de Navegação */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] bg-black/50 hover:bg-black text-white p-2 rounded-full border-2 border-white/50 hover:border-white transition-all group"
                >
                  <ChevronLeft size={32} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] bg-black/50 hover:bg-black text-white p-2 rounded-full border-2 border-white/50 hover:border-white transition-all group"
                >
                  <ChevronRight size={32} className="group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}

            <div className="relative w-full h-[60vh] bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.foto_url}
                alt={activePhoto.legenda}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 border-t-4 border-black bg-zinc-950 text-left">
              <span className="bg-[var(--mario-yellow)] text-black text-xs font-black px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                {categorias.find(c => c.id === activePhoto.categoria_id)?.nome || "Geral"}
              </span>
              {activePhoto.legenda && (
                <p className="text-lg font-bold text-white mt-4">
                  {activePhoto.legenda}
                </p>
              )}
              {activePhoto.localizacao && (
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1 font-bold uppercase">
                  <MapPin size={12} /> {activePhoto.localizacao}
                </p>
              )}
              <p className="text-[10px] text-zinc-500 mt-4 font-mono flex justify-between items-center">
                <span>Postado em: {new Date(activePhoto.created_at).toLocaleDateString("pt-BR")}</span>
                {isLoggedIn && canManage && (
                  <button
                    onClick={() => handleDeletePhoto(activePhoto)}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl font-black uppercase border-2 border-black flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {isManageCatsOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-4 border-black p-6 rounded-2xl w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-2">
              <h3 className="text-sm font-black uppercase text-white">Gerenciar Álbuns</h3>
              <button
                onClick={() => setIsManageCatsOpen(false)}
                className="text-xs font-black text-zinc-400 hover:text-white"
              >
                FECHAR
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatNome}
                  onChange={(e) => setNewCatNome(e.target.value)}
                  placeholder="Nome do Álbum (ex: Itália ou Fardella)"
                  className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold flex-1"
                />
                <button
                  type="submit"
                  className="game-button bg-[var(--mario-green)] text-white text-xs px-4"
                >
                  +
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-zinc-500">Este álbum é uma cidade de:</label>
                <select
                  value={parentCatId}
                  onChange={(e) => setParentCatId(e.target.value)}
                  className="bg-zinc-800 border-2 border-zinc-700 p-1.5 rounded-xl text-white text-[10px] font-bold w-full"
                >
                  <option value="">(Nenhum - Este é um País)</option>
                  {categorias.filter(c => !c.parent_id && c.nome !== "Geral").map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
            </form>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mt-2">
              {categorias.filter(cat => cat.nome !== "Geral").map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-zinc-800"
                >
                  <span className="text-xs font-bold text-white">{cat.nome}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditCategoryName(cat.nome);
                      }}
                      className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 rounded font-bold uppercase border border-zinc-700"
                      title="Editar Nome"
                    >
                      <Edit2 size={12} />
                    </button>
                    {cat.nome !== "Geral" && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.nome)}
                        className="text-[10px] bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded font-bold uppercase"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Formulário de Edição de Álbum (Apenas se editingCategory) */}
            {editingCategory && (
              <form onSubmit={handleUpdateCategory} className="flex flex-col gap-2 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase text-[var(--mario-yellow)]">Renomear Álbum</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="bg-zinc-900 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold flex-1"
                  />
                  <button
                    type="submit"
                    className="game-button bg-[var(--mario-green)] text-white text-[10px] px-3"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="game-button bg-zinc-700 text-white text-[10px] px-3"
                  >
                    X
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditPhoto}
            className="bg-zinc-900 border-4 border-black p-6 rounded-2xl w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3"
          >
            <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-2">
              <h3 className="text-sm font-black uppercase text-white">Editar Registro</h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="text-xs font-black text-zinc-400 hover:text-white"
              >
                CANCELAR
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Álbum</label>
              <select
                value={editCategoriaId}
                onChange={(e) => setEditCategoriaId(e.target.value)}
                className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold w-full"
              >
                {categorias.filter(cat => cat.nome !== "Geral").map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Localização</label>
              <input
                type="text"
                value={editLocalizacao}
                onChange={(e) => setEditLocalizacao(e.target.value)}
                className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Legenda</label>
              <textarea
                value={editLegenda}
                onChange={(e) => setEditLegenda(e.target.value)}
                className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="game-button bg-[var(--mario-yellow)] text-black w-full text-xs mt-2 font-black"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
