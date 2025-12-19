
import React, { useState, useEffect } from 'react';
import { Snippet, SnippetType, ViewMode, Language } from './types';
import { SnippetCard } from './components/SnippetCard';
import { AddSnippetModal } from './components/AddSnippetModal';
import { ConfirmModal } from './components/ConfirmModal';
import { LandingPage } from './components/LandingPage';
import { AboutPage } from './components/AboutPage';
import { LanguageDropdown } from './components/LanguageDropdown';
import { translations } from './utils/translations';
import { Plus, Search, Code2, Grid3x3, Grid2x2, Rows, Heart, Filter, Download, Loader2, AlertCircle, Layers } from 'lucide-react';
import { supabase, sendKeepAliveSignal } from './lib/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'APP' | 'ABOUT'>('LANDING');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | SnippetType | 'FAVORITES'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  
  const [language, setLanguage] = useState<Language>('ka');
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const t = translations[language];

  useEffect(() => {
    fetchSnippets();
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const checkMaintenance = async () => {
      const LAST_PULSE_KEY = 'codelib_maintenance_pulse';
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
      const lastPulse = localStorage.getItem(LAST_PULSE_KEY);
      const now = Date.now();
      if (!lastPulse || (now - parseInt(lastPulse || '0')) > FIVE_DAYS_MS) {
        const success = await sendKeepAliveSignal();
        if (success) localStorage.setItem(LAST_PULSE_KEY, now.toString());
      }
    };
    checkMaintenance();
  }, []);

  const fetchSnippets = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        setFetchError(`Supabase Error: ${error.message}`);
      } else if (data) {
        const mappedSnippets: Snippet[] = data.map((item: any) => {
          let createdAt = Date.now();
          if (item.created_at) {
            if (typeof item.created_at === 'number') {
              createdAt = item.created_at;
            } else if (typeof item.created_at === 'string') {
              const parsed = Number(item.created_at);
              createdAt = isNaN(parsed) ? new Date(item.created_at).getTime() : parsed;
            }
          }

          return {
            id: item.id,
            title: item.title || 'Untitled',
            description: item.description || '',
            code: item.code || '',
            type: (item.type as SnippetType) || 'component',
            category: item.category || 'Other',
            instruction: item.instruction || '',
            imageUrl: item.image_url,
            demoUrl: item.demo_url,
            downloadUrl: item.download_url,
            createdAt: createdAt,
            isFavorite: item.is_favorite || false
          };
        });
        setSnippets(mappedSnippets);
      }
    } catch (err: any) {
      setFetchError(`Connection Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSnippet = async (title: string, description: string, code: string, type: SnippetType, category: string, instruction: string, imageUrl?: string, demoUrl?: string, downloadUrl?: string) => {
    const newSnippet = {
      title,
      description,
      code: code || '',
      type,
      category,
      instruction,
      image_url: imageUrl,
      demo_url: demoUrl,
      download_url: downloadUrl,
      is_favorite: false
    };

    const { error } = await supabase.from('snippets').insert([newSnippet]);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
       fetchSnippets();
    }
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    let matchesType = filterType === 'ALL' || (filterType === 'FAVORITES' ? !!s.isFavorite : s.type === filterType);
    let matchesCategory = filterCategory === 'ALL' || s.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const availableCategories = Array.from(new Set(
    snippets
      .filter(s => filterType === 'ALL' || filterType === 'FAVORITES' || s.type === filterType)
      .map(s => s.category)
      .filter(Boolean)
  )).sort();

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const renderInstallButton = () => {
    if (!deferredPrompt) return null;
    return (
      <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl transition-all active:scale-95 border-2 border-white/20"
      >
          <Download size={18} />
          <span>{t.nav_install}</span>
      </button>
    );
  };

  if (currentView === 'LANDING') {
    return (
      <>
        {/* Install button fixed at bottom left to avoid overlap */}
        <div className="fixed bottom-6 left-6 z-[60]">
            {renderInstallButton()}
        </div>
        <LandingPage 
          onStart={() => setCurrentView('APP')} 
          onAbout={() => setCurrentView('ABOUT')} 
          lang={language}
          langSwitcher={<LanguageDropdown currentLang={language} onLanguageChange={setLanguage} />}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white cursor-pointer hover:bg-indigo-700 transition-colors" onClick={() => setCurrentView('LANDING')}>
                <Code2 size={24} />
              </div>
              <h1 className="hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer" onClick={() => setCurrentView('LANDING')}>{t.app_name}</h1>
            </div>
            
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => { setFilterType('ALL'); setFilterCategory('ALL'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t.nav_all}</button>
              <button onClick={() => { setFilterType('component'); setFilterCategory('ALL'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'component' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t.nav_components}</button>
              <button onClick={() => { setFilterType('website'); setFilterCategory('ALL'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'website' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t.nav_websites}</button>
              <button onClick={() => { setFilterType('template'); setFilterCategory('ALL'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'template' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t.nav_templates}</button>
              <button onClick={() => { setFilterType('FAVORITES'); setFilterCategory('ALL'); }} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${filterType === 'FAVORITES' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}><Heart size={14} fill={filterType === 'FAVORITES' ? "currentColor" : "none"} />{t.nav_favorites}</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                <Plus size={18} />
                <span className="hidden sm:inline">{t.nav_add}</span>
              </button>
              {/* Language Switcher moved to the right of Add button */}
              <LanguageDropdown currentLang={language} onLanguageChange={setLanguage} />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.library_title}</h2>
              <p className="text-slate-500">{filterType === 'ALL' ? t.library_subtitle_all : filterType === 'template' ? t.library_subtitle_templates : t.library_subtitle_all}. {snippets.length} {t.items_count}.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={18} className="absolute inset-y-0 left-3 mt-2.5 text-slate-400" />
                <input type="text" placeholder={t.search_placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
              
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <button 
                  onClick={() => setViewMode(ViewMode.GRID)} 
                  className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.GRID ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="3 Columns"
                >
                  <Grid3x3 size={18} />
                </button>
                <button 
                  onClick={() => setViewMode(ViewMode.LARGE_GRID)} 
                  className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.LARGE_GRID ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="2 Columns"
                >
                  <Grid2x2 size={18} />
                </button>
                <button 
                  onClick={() => setViewMode(ViewMode.LIST)} 
                  className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.LIST ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="1 Column (List)"
                >
                  <Rows size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {availableCategories.length > 0 && (
             <div className="flex gap-2 flex-wrap items-center">
               <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2"><Filter size={12} /> {t.filter_category}</span>
               <button onClick={() => setFilterCategory('ALL')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${filterCategory === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>{t.filter_all}</button>
               {availableCategories.map(cat => (
                 <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${filterCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{cat}</button>
               ))}
             </div>
          )}
        </div>
        
        {fetchError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
             <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
             <div className="flex-1">
                <h4 className="text-sm font-bold text-red-800 mb-1">Error fetching snippets</h4>
                <p className="text-xs text-red-600 font-mono">{fetchError}</p>
                <button onClick={fetchSnippets} className="mt-2 text-xs font-bold text-red-700 underline">Try Again</button>
             </div>
          </div>
        )}

        {isLoading && snippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-600 gap-4">
             <Loader2 size={40} className="animate-spin" />
             <p className="text-sm font-medium animate-pulse">Connecting to database...</p>
          </div>
        ) : filteredSnippets.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === ViewMode.LIST ? 'grid-cols-1 max-w-4xl mx-auto' : viewMode === ViewMode.LARGE_GRID ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} onDelete={(id) => setSnippetToDelete(id)} onUpdate={async (id, code) => { await supabase.from('snippets').update({ code }).eq('id', id); fetchSnippets(); }} onSaveAs={async (id, code, title) => { const s = snippets.find(x => x.id === id); if (s) { await supabase.from('snippets').insert([{ ...s, id: undefined, title, code }]); fetchSnippets(); } }} onToggleFavorite={async (id) => { const s = snippets.find(x => x.id === id); if (s) { await supabase.from('snippets').update({ is_favorite: !s.isFavorite }).eq('id', id); fetchSnippets(); } }} lang={language} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Layers size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">{t.no_codes_title}</p>
            <p className="text-sm">{t.no_codes_desc}</p>
          </div>
        )}
      </main>

      <AddSnippetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddSnippet} existingCategories={Array.from(new Set(snippets.map(s => s.category).filter(Boolean)))} lang={language} />
      <ConfirmModal isOpen={!!snippetToDelete} onClose={() => setSnippetToDelete(null)} onConfirm={async () => { if (snippetToDelete) { await supabase.from('snippets').delete().eq('id', snippetToDelete); fetchSnippets(); setSnippetToDelete(null); } }} lang={language} />
      
      {currentView === 'ABOUT' && <AboutPage onBack={() => setCurrentView('LANDING')} onStart={() => setCurrentView('APP')} lang={language} />}
    </div>
  );
};

export default App;
