import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Snippet, TabState, Language } from '../types';
import { Copy, Trash2, Eye, Code as CodeIcon, Maximize2, X, Save, FilePlus, Search, ArrowDown, Columns, Monitor, Heart, Tag, Sun, Moon } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { translations } from '../utils/translations';

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

  // Editing state
  const [localCode, setLocalCode] = useState(snippet.code);
  const [debouncedCode, setDebouncedCode] = useState(snippet.code); // For iframe
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [newTitle, setNewTitle] = useState(`${snippet.title} (copy)`);
  
  // Editor Theme
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  
  // Fullscreen specific state
  const [fsView, setFsView] = useState<'preview' | 'code' | 'split'>('preview');
  const [fsShowSaveAs, setFsShowSaveAs] = useState(false);
  const [fsNewTitle, setFsNewTitle] = useState(`${snippet.title} (copy)`);
  const [fsIsCopied, setFsIsCopied] = useState(false);

  // Sync local code if prop changes
  useEffect(() => {
    setLocalCode(snippet.code);
    setIsDirty(false);
  }, [snippet.code]);

  // Debounce logic
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

  const handleSave = () => {
    onUpdate(snippet.id, localCode);
    setIsDirty(false);
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

  const handleSaveAsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onSaveAs(snippet.id, localCode, newTitle);
      setShowSaveAs(false);
      
      // Revert the current card to original state to show it wasn't modified
      setLocalCode(snippet.code); 
      setIsDirty(false);
    }
  };

  const handleFsSaveAsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fsNewTitle.trim()) {
      onSaveAs(snippet.id, localCode, fsNewTitle);
      setFsShowSaveAs(false);
      
      // Revert the current card to original state to show it wasn't modified
      setLocalCode(snippet.code);
      setIsDirty(false);
    }
  };

  const handleFsCopy = () => {
    navigator.clipboard.writeText(localCode);
    setFsIsCopied(true);
    setTimeout(() => setFsIsCopied(false), 2000);
  };

  const toggleTheme = () => {
    setEditorTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Fullscreen Modal Content
  const fullScreenModalContent = (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Fullscreen Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-slate-700 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            {fsShowSaveAs ? (
                <form onSubmit={handleFsSaveAsSubmit} className="flex items-center gap-2 w-full max-w-md animate-in fade-in slide-in-from-left-2">
                  <input 
                    autoFocus
                    value={fsNewTitle}
                    onChange={(e) => setFsNewTitle(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    placeholder={t.card_new_name}
                  />
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
                
                {/* View Switcher */}
                <div className="hidden sm:flex bg-slate-800 rounded-lg p-1 ml-4 border border-slate-700 shrink-0">
                  <button 
                    onClick={() => setFsView('preview')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${fsView === 'preview' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Monitor size={14} />
                    <span>Preview</span>
                  </button>
                  <button 
                    onClick={() => setFsView('split')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${fsView === 'split' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Columns size={14} />
                    <span>Split</span>
                  </button>
                  <button 
                    onClick={() => setFsView('code')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${fsView === 'code' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <CodeIcon size={14} />
                    <span>Code</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${isDirty ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              title={t.card_save}
            >
              <Save size={16} />
              <span className="hidden sm:inline">{t.card_save}</span>
            </button>
            
            {!fsShowSaveAs && (
              <button
                  onClick={() => setFsShowSaveAs(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm bg-slate-800 text-slate-400 hover:text-green-400 hover:bg-slate-700 transition-all"
                  title={t.card_save_as}
              >
                  <FilePlus size={16} />
                  <span className="hidden sm:inline">{t.card_save_as}</span>
              </button>
            )}

            <div className="w-px h-6 bg-slate-700 mx-1" />

            <button 
              onClick={() => setIsFullScreen(false)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              title={t.lp_close}
            >
              <X size={24} />
            </button>
          </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
          {/* Code Editor Area */}
          {(fsView === 'code' || fsView === 'split') && (
            <div className={`flex flex-col border-r border-slate-700 bg-neutral-900 ${fsView === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="px-4 py-2 bg-[#252526] text-xs text-slate-400 border-b border-[#3e3e3e] flex justify-between items-center h-10 shrink-0">
                <span className="hidden sm:inline font-mono">HTML / CSS</span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white hover:bg-[#3e3e3e] rounded transition-colors"
                  >
                     {editorTheme === 'light' ? <Moon size={12} /> : <Sun size={12} />}
                  </button>

                  <div className="w-px h-3 bg-[#3e3e3e]" />
                  
                  <button 
                      onClick={handleFsCopy}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#3e3e3e] rounded text-slate-400 hover:text-white transition-colors"
                      title={t.card_copy}
                  >
                      <Copy size={12} />
                      <span className="hidden sm:inline">{fsIsCopied ? t.card_copied : 'Copy'}</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative overflow-hidden">
                <CodeEditor 
                   value={localCode}
                   onChange={handleCodeChange}
                   theme={editorTheme}
                />
              </div>
            </div>
          )}

          {/* Preview Area */}
          {(fsView === 'preview' || fsView === 'split') && (
            <div className={`bg-white relative flex-col flex ${fsView === 'split' ? 'w-1/2' : 'w-full'}`}>
              {fsView === 'split' && (
                <div className="px-4 py-2 bg-slate-100 text-xs text-slate-500 border-b border-slate-200 flex justify-between h-10 items-center shrink-0">
                  <span>Live Preview</span>
                </div>
              )}
              <div className="flex-1 relative w-full h-full">
                <iframe
                    title={`${snippet.title}-fullscreen`}
                    srcDoc={debouncedCode} 
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-modals allow-forms allow-popups"
                  />
              </div>
            </div>
          )}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px] transition-all duration-300 hover:shadow-md relative group">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1 mr-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               {showSaveAs ? (
                 <form onSubmit={handleSaveAsSubmit} className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2">
                   <input 
                     autoFocus
                     value={newTitle}
                     onChange={(e) => setNewTitle(e.target.value)}
                     className="px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                   />
                   <button type="submit" className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={16} /></button>
                   <button type="button" onClick={() => setShowSaveAs(false)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                 </form>
               ) : (
                 <>
                   <h3 className="font-bold text-slate-800 text-lg line-clamp-1" title={snippet.title}>
                     {snippet.title}
                   </h3>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${snippet.type === 'website' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                     {snippet.type === 'website' ? t.card_type_website : t.card_type_component}
                   </span>
                 </>
               )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
               {snippet.category && (
                 <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    <Tag size={10} />
                    {snippet.category}
                 </span>
               )}
               <p className="line-clamp-1 flex-1">{snippet.description}</p>
            </div>
          </div>
          
          <div className="flex gap-1 shrink-0">
             <button 
              type="button"
              onClick={handleFavoriteClick}
              className={`p-2 rounded-lg transition-colors ${snippet.isFavorite ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
            >
              <Heart size={16} fill={snippet.isFavorite ? "currentColor" : "none"} />
            </button>
             <button 
              type="button"
              onClick={() => setIsFullScreen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Maximize2 size={16} />
            </button>
             <button 
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 relative">
          <button
            onClick={() => setActiveTab(TabState.PREVIEW)}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === TabState.PREVIEW 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Eye size={16} />
            <span>{t.card_view}</span>
          </button>
          <button
            onClick={() => setActiveTab(TabState.CODE)}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === TabState.CODE 
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CodeIcon size={16} />
            <span>{t.card_code}</span>
            {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" title={t.card_unsaved} />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden group/content">
          {activeTab === TabState.PREVIEW ? (
            <div className="w-full h-full bg-white relative">
               <iframe
                title={snippet.title}
                srcDoc={debouncedCode}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col">
              {/* Toolbar */}
              <div className={`flex items-center justify-between px-2 py-1 border-b transition-colors ${editorTheme === 'dark' ? 'bg-[#2d2d2d] border-[#3e3e3e]' : 'bg-slate-100 border-slate-200'}`}>
                 <div className="flex items-center gap-1">
                   <button 
                    onClick={toggleTheme}
                    className={`p-1.5 rounded transition-colors ${editorTheme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-[#3e3e3e]' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                  >
                     {editorTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                   </button>
                 </div>

                 <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1 p-1.5 rounded transition-colors ${editorTheme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-[#3e3e3e]' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                      title={t.card_copy}
                    >
                      <Copy size={14} />
                      {isCopied && <span className="text-[10px] text-green-400">{t.card_copied}</span>}
                    </button>
                    
                    <div className={`w-px h-4 mx-1 ${editorTheme === 'dark' ? 'bg-[#3e3e3e]' : 'bg-slate-300'}`} />

                    <button
                      onClick={handleSave}
                      disabled={!isDirty}
                      className={`flex items-center gap-1 p-1.5 rounded transition-colors ${isDirty ? 'text-amber-500 hover:text-amber-600' : 'text-slate-400 cursor-not-allowed'}`}
                      title={t.card_save}
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setShowSaveAs(true)}
                      className={`flex items-center gap-1 p-1.5 rounded transition-colors ${editorTheme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-[#3e3e3e]' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                      title={t.card_save_as}
                    >
                      <FilePlus size={14} />
                    </button>
                 </div>
              </div>

              <div className="flex-1 relative overflow-hidden">
                <CodeEditor 
                  value={localCode}
                  onChange={handleCodeChange}
                  theme={editorTheme}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-50 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between items-center">
          <span>ID: {snippet.id.slice(0, 8)}</span>
          <div className="flex gap-2">
            {isDirty && <span className="text-amber-600 font-medium">{t.card_not_saved}</span>}
            <span>{new Date(snippet.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'ka-GE')}</span>
          </div>
        </div>
      </div>

      {isFullScreen && createPortal(fullScreenModalContent, document.body)}
    </>
  );
};