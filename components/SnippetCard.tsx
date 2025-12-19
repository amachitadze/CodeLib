import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Snippet, TabState, Language } from '../types';
import { Copy, Trash2, Eye, Code as CodeIcon, Maximize2, X, Save, FilePlus, Search, ArrowDown, Columns, Monitor, Heart, Tag, Sun, Moon, Info, ExternalLink, Download } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { translations } from '../utils/translations';
import { PasswordPromptModal } from './PasswordPromptModal';

interface SnippetCardProps {
  snippet: Snippet;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newCode: string) => void;
  onSaveAs: (originalId: string, newCode: string, newTitle: string) => void;
  onToggleFavorite: (id: string) => void;
  lang: Language;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onDelete, onUpdate, onSaveAs, onToggleFavorite, lang }) => {
  const [activeTab, setActiveTab] = useState<TabState>(TabState.PREVIEW);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const t = translations[lang];

  const [localCode, setLocalCode] = useState(snippet.code || '');
  const [debouncedCode, setDebouncedCode] = useState(snippet.code || '');
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [newTitle, setNewTitle] = useState(`${snippet.title} (copy)`);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  
  const [fsView, setFsView] = useState<'preview' | 'code' | 'split'>('preview');
  const [fsShowSaveAs, setFsShowSaveAs] = useState(false);
  const [fsNewTitle, setFsNewTitle] = useState(`${snippet.title} (copy)`);
  const [fsIsCopied, setFsIsCopied] = useState(false);

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setLocalCode(snippet.code || '');
    setIsDirty(false);
  }, [snippet.code]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(localCode);
    }, 500);
    return () => clearTimeout(timer);
  }, [localCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
    setIsDirty(true);
  };

  const performSave = () => {
    onUpdate(snippet.id, localCode);
    setIsDirty(false);
  };

  const handleSave = () => {
    setPendingAction(() => performSave);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(snippet.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(snippet.id);
  };

  const performSaveAs = (titleToUse: string) => {
    onSaveAs(snippet.id, localCode, titleToUse);
    setShowSaveAs(false);
    setFsShowSaveAs(false);
    setLocalCode(snippet.code || ''); 
    setIsDirty(false);
  };

  const handleSaveAsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      setPendingAction(() => () => performSaveAs(newTitle));
    }
  };

  const isTemplate = snippet.type === 'template';

  // Fullscreen Modal Content
  const fullScreenModalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-slate-700 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            {fsShowSaveAs ? (
                <form onSubmit={(e) => { e.preventDefault(); if (fsNewTitle.trim()) setPendingAction(() => () => performSaveAs(fsNewTitle)); }} className="flex items-center gap-2 w-full max-w-md animate-in fade-in slide-in-from-left-2">
                  <input autoFocus value={fsNewTitle} onChange={(e) => setFsNewTitle(e.target.value)} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" placeholder={t.card_new_name} />
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded"><Save size={18} /></button>
                  <button type="button" onClick={() => setFsShowSaveAs(false)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded"><X size={18} /></button>
                </form>
            ) : (
              <>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{snippet.title}</h3>
                  <div className="flex gap-2 text-xs text-slate-400 items-center">
                    {isDirty && <span className="text-amber-400 font-bold">{t.card_not_saved}</span>}
                    <span className="hidden sm:inline">{t.card_fullscreen}</span>
                  </div>
                </div>
                {!isTemplate && (
                  <div className="hidden sm:flex bg-slate-800 rounded-lg p-1 ml-4 border border-slate-700 shrink-0">
                    <button onClick={() => setFsView('preview')} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${fsView === 'preview' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><Monitor size={14} /><span>Preview</span></button>
                    <button onClick={() => setFsView('split')} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${fsView === 'split' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><Columns size={14} /><span>Split</span></button>
                    <button onClick={() => setFsView('code')} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${fsView === 'code' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><CodeIcon size={14} /><span>Code</span></button>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {!isTemplate && (
              <button onClick={handleSave} disabled={!isDirty} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${isDirty ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`} title={t.card_save}>
                <Save size={16} /><span className="hidden sm:inline">{t.card_save}</span>
              </button>
            )}
            
            {!fsShowSaveAs && (
              <button onClick={() => setFsShowSaveAs(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm bg-slate-800 text-slate-400 hover:text-green-400 transition-all">
                  <FilePlus size={16} /><span className="hidden sm:inline">{t.card_save_as}</span>
              </button>
            )}
            <button onClick={() => setIsFullScreen(false)} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"><X size={24} /></button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-slate-100">
          {isTemplate ? (
             <div className="flex-1 flex flex-col md:flex-row bg-white overflow-y-auto">
                <div className="md:w-2/3 p-8 border-r border-slate-200">
                   <img src={snippet.imageUrl} alt={snippet.title} className="w-full rounded-xl shadow-lg mb-8" />
                   <h2 className="text-3xl font-bold text-slate-900 mb-4">{snippet.title}</h2>
                   <p className="text-slate-600 mb-8 text-lg leading-relaxed">{snippet.description}</p>
                   {snippet.instruction && (
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 className="font-bold flex items-center gap-2 text-indigo-700 mb-4"><Info size={18} /> {t.card_instruction_title}</h4>
                        <p className="whitespace-pre-wrap text-slate-600">{snippet.instruction}</p>
                     </div>
                   )}
                </div>
                <div className="md:w-1/3 p-8 bg-slate-50 flex flex-col gap-6">
                   <div className="space-y-4">
                      {snippet.demoUrl && (
                        <a href={snippet.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                           <ExternalLink size={20} /> {t.card_demo_link}
                        </a>
                      )}
                      {snippet.downloadUrl && (
                        <a href={snippet.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                           <Download size={20} /> {t.card_download_link}
                        </a>
                      )}
                   </div>
                </div>
             </div>
          ) : (
            <>
              {(fsView === 'code' || fsView === 'split') && (
                <div className={`flex flex-col border-r border-slate-700 bg-neutral-900 ${fsView === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <div className="px-4 py-2 bg-[#252526] text-xs text-slate-400 border-b border-[#3e3e3e] flex justify-between items-center h-10 shrink-0">
                    <span className="font-mono">CODE EDITOR</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditorTheme(t => t === 'light' ? 'dark' : 'light')} className="p-1 hover:bg-slate-800 rounded">{editorTheme === 'light' ? <Moon size={14}/> : <Sun size={14}/>}</button>
                      <button onClick={() => { navigator.clipboard.writeText(localCode); setFsIsCopied(true); setTimeout(() => setFsIsCopied(false), 2000); }} className="flex items-center gap-1 hover:text-white transition-colors"><Copy size={12}/>{fsIsCopied ? t.card_copied : 'Copy'}</button>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden"><CodeEditor value={localCode} onChange={handleCodeChange} theme={editorTheme} /></div>
                </div>
              )}
              {(fsView === 'preview' || fsView === 'split') && (
                <div className={`bg-white relative flex flex-col ${fsView === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <iframe title={`${snippet.title}-fs`} srcDoc={debouncedCode} className="w-full h-full border-none" sandbox="allow-scripts allow-forms allow-popups" />
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${isTemplate ? 'h-auto pb-4' : 'h-[500px]'} transition-all duration-300 hover:shadow-md relative group`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1 mr-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               {showSaveAs ? (
                 <form onSubmit={handleSaveAsSubmit} className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2">
                   <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="px-2 py-1 text-sm border border-indigo-300 rounded outline-none w-full" />
                   <button type="submit" className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={16} /></button>
                   <button type="button" onClick={() => setShowSaveAs(false)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                 </form>
               ) : (
                 <>
                   <h3 className="font-bold text-slate-800 text-lg line-clamp-1" title={snippet.title}>{snippet.title}</h3>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isTemplate ? 'bg-amber-100 text-amber-700' : snippet.type === 'website' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                     {isTemplate ? t.card_type_template : snippet.type === 'website' ? t.card_type_website : t.card_type_component}
                   </span>
                 </>
               )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
               {snippet.category && <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><Tag size={10}/>{snippet.category}</span>}
               <p className="line-clamp-1">{snippet.description}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
             <button onClick={handleFavoriteClick} className={`p-2 rounded-lg transition-colors ${snippet.isFavorite ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}><Heart size={16} fill={snippet.isFavorite ? "currentColor" : "none"} /></button>
             <button onClick={() => setIsFullScreen(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Maximize2 size={16} /></button>
             <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
          </div>
        </div>

        {isTemplate ? (
          <div className="p-4 flex flex-col gap-4">
             <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-100 relative group/img">
                <img src={snippet.imageUrl} alt={snippet.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => setIsFullScreen(true)} className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2"><Eye size={16}/> {t.card_view}</button>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <a href={snippet.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-all border border-indigo-100"><ExternalLink size={14}/> {t.card_demo_link}</a>
                <a href={snippet.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"><Download size={14}/> {t.card_download_link}</a>
             </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-slate-100 relative">
              <button onClick={() => setActiveTab(TabState.PREVIEW)} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === TabState.PREVIEW ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}><Eye size={16}/><span>{t.card_view}</span></button>
              <button onClick={() => setActiveTab(TabState.CODE)} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === TabState.CODE ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}><CodeIcon size={16}/><span>{t.card_code}</span>{isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" />}</button>
            </div>
            <div className="flex-1 relative bg-slate-100 overflow-hidden">
              {activeTab === TabState.PREVIEW ? (
                <iframe title={snippet.title} srcDoc={debouncedCode} className="w-full h-full bg-white border-none" sandbox="allow-scripts allow-forms allow-popups" />
              ) : (
                <div className="relative w-full h-full flex flex-col">
                  <div className={`flex items-center justify-between px-2 py-1 border-b ${editorTheme === 'dark' ? 'bg-[#2d2d2d] border-[#3e3e3e]' : 'bg-slate-100 border-slate-200'}`}>
                    <button onClick={() => setEditorTheme(t => t === 'light' ? 'dark' : 'light')} className="p-1.5 rounded hover:bg-white/10">{editorTheme === 'light' ? <Moon size={14}/> : <Sun size={14}/>}</button>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy} className="p-1.5 rounded hover:bg-white/10 flex items-center gap-1 text-slate-500">{isCopied ? <span className="text-green-500 text-[10px]">OK</span> : <Copy size={14}/>}</button>
                      <button onClick={handleSave} disabled={!isDirty} className={`p-1.5 rounded ${isDirty ? 'text-amber-500' : 'text-slate-300'}`}><Save size={14}/></button>
                      <button onClick={() => setShowSaveAs(true)} className="p-1.5 rounded text-slate-400"><FilePlus size={14}/></button>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden"><CodeEditor value={localCode} onChange={handleCodeChange} theme={editorTheme} /></div>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="p-3 bg-slate-50 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between items-center">
          <span>{snippet.id.slice(0, 8)}</span>
          <div className="flex gap-2">
            {isDirty && <span className="text-amber-600 font-bold">{t.card_not_saved}</span>}
            <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {isFullScreen && createPortal(fullScreenModalContent, document.body)}
      <PasswordPromptModal isOpen={!!pendingAction} onClose={() => setPendingAction(null)} onSuccess={() => { pendingAction?.(); setPendingAction(null); }} lang={lang} />
    </>
  );
};