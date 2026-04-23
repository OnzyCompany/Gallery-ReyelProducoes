import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft, Loader2, Image as ImageIcon, ExternalLink, Lock, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { categories as initialCategories } from '../constants';
import type { Category, Image } from '../types';

interface DBImage {
  id: string;
  url: string;
  title: string;
  category_id?: string | null;
  subcategory_id?: string | null;
}

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [images, setImages] = useState<Partial<DBImage>[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');

  useEffect(() => {
    if (!supabase?.auth) {
      console.error('Supabase auth not available');
      setAuthLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChanged((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reyel_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCategories(initialCategories);
      if (initialCategories.length > 0) {
        setSelectedCategoryId(initialCategories[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setCategories(initialCategories);
    } finally {
      setLoading(false);
    }
  }

  const activeCategory = categories.find(c => c.id === selectedCategoryId);
  const subCategories = activeCategory?.subCategories || [];

  useEffect(() => {
    if (user && selectedCategoryId) {
      fetchImages();
    }
  }, [selectedCategoryId, selectedSubCategoryId, user]);

  async function fetchImages() {
    setLoading(true);
    try {
      let query = supabase.from('reyel_images').select('*');
      
      if (selectedSubCategoryId) {
        query = query.eq('subcategory_id', selectedSubCategoryId);
      } else {
        query = query.eq('category_id', selectedCategoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addImage() {
    if (!newImageUrl || !newImageTitle) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from('reyel_images').insert({
        url: newImageUrl,
        title: newImageTitle,
        category_id: selectedSubCategoryId ? null : selectedCategoryId,
        subcategory_id: selectedSubCategoryId || null,
      }).select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setImages([data[0], ...images]);
      }
      setNewImageUrl('');
      setNewImageTitle('');
    } catch (err) {
      console.error('Error adding image:', err);
      alert('Erro ao adicionar imagem. Verifique as permissões de segurança (RLS) no Supabase.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;
    try {
      const { error } = await supabase.from('reyel_images').delete().eq('id', id);
      if (error) throw error;
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">Acesso Restrito</h1>
            <p className="text-gray-400 text-sm text-center">Faça login com suas credenciais do Supabase</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-mail</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {loginError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20"
            >
              {loginLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Entrar'}
            </button>
          </form>

          <button 
            onClick={onBack}
            className="w-full mt-4 text-gray-500 hover:text-white text-sm py-2 transition-colors"
          >
            Voltar para a Galeria
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-xs text-gray-500">Logado como: {user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 rounded-lg transition-all border border-gray-700"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </header>

        <section className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-red-500" />
            Adicionar Nova Imagem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Título da Imagem</label>
              <input 
                type="text" 
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Ex: Show de Rock 2024"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Link da Imagem (URL)</label>
              <input 
                type="text" 
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Categoria Principal</label>
              <select 
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedSubCategoryId(null);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {subCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="block text-sm font-medium text-gray-400 mb-1">Subcategoria (Opcional)</label>
                <select 
                  value={selectedSubCategoryId || ''}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value || null)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 outline-none"
                >
                  <option value="">Nenhuma (Direto na Categoria)</option>
                  {subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </div>

          <button 
            onClick={addImage}
            disabled={saving || !newImageUrl || !newImageTitle}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Imagem no Banco
          </button>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Imagens Cadastradas</h2>
            <div className="text-sm text-gray-400">
              {images.length} imagens encontradas
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group relative"
                  >
                    <div className="aspect-video relative overflow-hidden bg-gray-900">
                      <img 
                        src={img.url} 
                        alt={img.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1f2937/white?text=Erro+no+Link';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          href={img.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-blue-600 rounded-full hover:bg-blue-700"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => deleteImage(img.id!)}
                          className="p-2 bg-red-600 rounded-full hover:bg-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium truncate">{img.title}</p>
                      <p className="text-xs text-gray-500 truncate">{img.url}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">Nenhuma imagem neste filtro.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
