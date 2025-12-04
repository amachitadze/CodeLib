import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Snippet, TabState } from '../types';
import { Copy, Trash2, Eye, Code as CodeIcon, Maximize2, X, Save, FilePlus, Search, ArrowDown, Columns, Monitor } from 'lucide-react';

interface SnippetCardProps {
  snippet: Snippet;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newCode: string) => void;
  onSaveAs: (originalId: string, newCode: string, newTitle: string) => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onDelete, onUpdate, onSaveAs }) => {
  const [activeTab, setActiveTab] = useState<TabState>(TabState.PREVIEW);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Editing state
  const [localCode, setLocalCode] = useState(snippet.code);
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [newTitle, setNewTitle] = useState(`${snippet.title} (ასლი)`);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local code if prop changes (rare, but good practice)
  useEffect(() => {
    setLocalCode(snippet.code);
    setIsDirty(false);
  }, [snippet.code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(localCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalCode(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    onUpdate(snippet.id, localCode);
    setIsDirty(false);
  };

  const handleSaveAsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onSaveAs(snippet.id, localCode, newTitle);
      setShowSaveAs(false);
      setIsDirty(false); // Reset dirty on current card
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm || !textareaRef.current) return;

    const text = localCode.toLowerCase();
    const term = searchTerm.toLowerCase();
    const startPos = textareaRef.current.selectionStart + 1;
    
    // Search from current position
    let index = text.indexOf(term, startPos);
    
    // Wrap around if not found
    if (index === -1) {
      index = text.indexOf(term, 0);
    }

    if (index !== -1) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(index, index + term.length);
      // Scroll to selection (rudimentary)
      const blur = textareaRef.current.scrollHeight * (index / text.length);
      textareaRef.current.scrollTop = blur - textareaRef.current.clientHeight / 2;
    }
  };

  const FullScreenModal = () => {
    const [view, setView] = useState<'preview' | 'code' | 'split'>('preview');
    
    // Fullscreen specific Save As state
    const [fsShowSaveAs, setFsShowSaveAs] = useState(false);
    const [fsNewTitle, setFsNewTitle] = useState(`${snippet.title} (ასლი)`);

    // Fullscreen specific Search state
    const [fsIsSearchOpen, setFsIsSearchOpen] = useState(false);
    const [fsSearchTerm, setFsSearchTerm] = useState('');
    const [fsIsCopied, setFsIsCopied] = useState(false);
    const fsTextareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFsSaveAsSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (fsNewTitle.trim()) {
        onSaveAs(snippet.id, localCode, fsNewTitle);
        setFsShowSaveAs(false);
        setIsDirty(false);
      }
    };

    const handleFsSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fsSearchTerm || !fsTextareaRef.current) return;
    
        const text = localCode.toLowerCase();
        const term = fsSearchTerm.toLowerCase();
        const startPos = fsTextareaRef.current.selectionStart + 1;
        
        let index = text.indexOf(term, startPos);
        if (index === -1) {
          index = text.indexOf(term, 0);
        }
    
        if (index !== -1) {
          fsTextareaRef.current.focus();
          fsTextareaRef.current.setSelectionRange(index, index + term.length);
          const blur = fsTextareaRef.current.scrollHeight * (index / text.length);
          fsTextareaRef.current.scrollTop = blur - fsTextareaRef.current.clientHeight / 2;
        }
      };

    const handleFsCopy = () => {
        navigator.clipboard.writeText(localCode);
        setFsIsCopied(true);
        setTimeout(() => setFsIsCopied(false), 2000);
    };

    return (
      <div 
        className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Fullscreen Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-slate-700 bg-slate-900 text-white">
           <div className="flex items-center gap-4 flex-1">
              {fsShowSaveAs ? (
                 <form onSubmit={handleFsSaveAsSubmit} className="flex items-center gap-2 w-full max-w-md animate-in fade-in slide-in-from-left-2">
                   <input 
                     autoFocus
                     value={fsNewTitle}
                     onChange={(e) => setFsNewTitle(e.target.value)}
                     className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                     placeholder="ახალი სახელი..."
                   />
                   <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded"><Save size={18} /></button>
                   <button type="button" onClick={() => setFsShowSaveAs(false)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded"><X size={18} /></button>
                 </form>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg">{snippet.title}</h3>
                    <div className="flex gap-2 text-xs text-slate-400">
                      {isDirty && <span className="text-amber-400">● შენახვა გჭირდებათ</span>}
                      <span>სრული ეკრანის რეჟიმი</span>
                    </div>
                  </div>
                  
                  {/* View Switcher */}
                  <div className="hidden sm:flex bg-slate-800 rounded-lg p-1 ml-4 border border-slate-700">
                    <button 
                      onClick={() => setView('preview')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${view === 'preview' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Monitor size={14} />
                      <span>Preview</span>
                    </button>
                    <button 
                      onClick={() => setView('split')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${view === 'split' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Columns size={14} />
                      <span>Split</span>
                    </button>
                    <button 
                      onClick={() => setView('code')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all ${view === 'code' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      <CodeIcon size={14} />
                      <span>Code</span>
                    </button>
                  </div>
                </>
              )}
           </div>
           
           <div className="flex items-center gap-2">
             <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${isDirty ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                title="შენახვა (Overwrite)"
             >
               <Save size={16} />
               <span className="hidden sm:inline">შენახვა</span>
             </button>
             
             {!fsShowSaveAs && (
                <button
                    onClick={() => setFsShowSaveAs(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm bg-slate-800 text-slate-400 hover:text-green-400 hover:bg-slate-700 transition-all"
                    title="შენახვა როგორც (Save As)"
                >
                    <FilePlus size={16} />
                    <span className="hidden sm:inline">ასლი</span>
                </button>
             )}

             <div className="w-px h-6 bg-slate-700 mx-1" />

             <button 
               onClick={() => setIsFullScreen(false)}
               className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
               title="დახურვა"
             >
               <X size={24} />
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden bg-slate-100">
           {/* Code Editor Area */}
           {(view === 'code' || view === 'split') && (
             <div className={`flex flex-col border-r border-slate-700 bg-[#1e1e1e] ${view === 'split' ? 'w-1/2' : 'w-full'}`}>
                {/* Fullscreen Editor Toolbar */}
                <div className="px-4 py-2 bg-[#252526] text-xs text-slate-400 border-b border-[#3e3e3e] flex justify-between items-center h-10">
                  <span className="hidden sm:inline">HTML / CSS Editor</span>
                  
                  <div className="flex items-center gap-2">
                    {/* Search in Fullscreen */}
                    <div className="flex items-center gap-1 bg-[#1e1e1e] rounded border border-[#3e3e3e]">
                       {fsIsSearchOpen ? (
                         <form onSubmit={handleFsSearch} className="flex items-center px-1">
                           <input 
                             autoFocus
                             type="text" 
                             value={fsSearchTerm}
                             onChange={(e) => setFsSearchTerm(e.target.value)}
                             placeholder="ძებნა..." 
                             className="bg-transparent text-xs text-white focus:outline-none w-24 sm:w-32 py-1"
                           />
                           <button type="submit" className="text-slate-400 hover:text-white p-1"><ArrowDown size={12} /></button>
                           <button type="button" onClick={() => setFsIsSearchOpen(false)} className="text-slate-400 hover:text-white p-1"><X size={12} /></button>
                         </form>
                       ) : (
                         <button onClick={() => setFsIsSearchOpen(true)} className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white" title="ძებნა">
                           <Search size={12} />
                           <span className="hidden sm:inline">ძებნა</span>
                         </button>
                       )}
                    </div>
                    
                    <div className="w-px h-3 bg-[#3e3e3e]" />
                    
                    <button 
                        onClick={handleFsCopy}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-[#3e3e3e] rounded text-slate-400 hover:text-white transition-colors"
                        title="კოპირება"
                    >
                        <Copy size={12} />
                        <span className="hidden sm:inline">{fsIsCopied ? 'OK' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                
                <textarea
                  ref={fsTextareaRef}
                  value={localCode}
                  onChange={handleCodeChange}
                  spellCheck={false}
                  className="flex-1 w-full bg-[#1e1e1e] text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none custom-scrollbar leading-relaxed"
                />
             </div>
           )}

           {/* Preview Area */}
           {(view === 'preview' || view === 'split') && (
             <div className={`bg-white relative flex-col flex ${view === 'split' ? 'w-1/2' : 'w-full'}`}>
                {view === 'split' && (
                  <div className="px-4 py-2 bg-slate-100 text-xs text-slate-500 border-b border-slate-200 flex justify-between h-10 items-center">
                    <span>Live Preview</span>
                  </div>
                )}
                <div className="flex-1 relative">
                  <iframe
                      title={`${snippet.title}-fullscreen`}
                      srcDoc={localCode} 
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-modals allow-forms allow-popups"
                    />
                </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px] transition-all duration-300 hover:shadow-md relative group">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1 mr-2">
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
                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${snippet.type === 'website' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                     {snippet.type === 'website' ? 'WEBSITE' : 'COMPONENT'}
                   </span>
                 </>
               )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{snippet.description}</p>
          </div>
          
          <div className="flex gap-1 shrink-0">
             <button 
              onClick={() => setIsFullScreen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="გადიდება"
            >
              <Maximize2 size={16} />
            </button>
             <button 
              onClick={() => onDelete(snippet.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="წაშლა"
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
            <span>ნახვა</span>
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
            <span>კოდი</span>
            {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" title="შენახვა გჭირდებათ" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden group/content">
          {activeTab === TabState.PREVIEW ? (
            <div className="w-full h-full bg-white relative">
               <iframe
                title={snippet.title}
                srcDoc={localCode}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="relative w-full h-full bg-[#1e1e1e] flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-2 py-1 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                 <div className="flex items-center gap-1">
                   {isSearchOpen ? (
                     <form onSubmit={handleSearch} className="flex items-center bg-[#1e1e1e] rounded px-2 py-0.5 border border-[#4b5563]">
                       <input 
                         autoFocus
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="ძებნა..." 
                         className="bg-transparent text-xs text-white focus:outline-none w-24 sm:w-32"
                       />
                       <button type="submit" className="text-slate-400 hover:text-white"><ArrowDown size={12} /></button>
                       <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-1 text-slate-400 hover:text-white"><X size={12} /></button>
                     </form>
                   ) : (
                     <button onClick={() => setIsSearchOpen(true)} className="p-1.5 text-slate-400 hover:text-white hover:bg-[#3e3e3e] rounded" title="ძებნა">
                       <Search size={14} />
                     </button>
                   )}
                 </div>

                 <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-white hover:bg-[#3e3e3e] rounded transition-colors"
                      title="კოპირება"
                    >
                      <Copy size={14} />
                      {isCopied && <span className="text-[10px] text-green-400">OK</span>}
                    </button>
                    
                    <div className="w-px h-4 bg-[#3e3e3e] mx-1" />

                    <button
                      onClick={handleSave}
                      disabled={!isDirty}
                      className={`flex items-center gap-1 p-1.5 rounded transition-colors ${isDirty ? 'text-amber-400 hover:text-amber-300 hover:bg-[#3e3e3e]' : 'text-slate-600 cursor-not-allowed'}`}
                      title="შენახვა (Overwrite)"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setShowSaveAs(true)}
                      className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-green-400 hover:bg-[#3e3e3e] rounded transition-colors"
                      title="შენახვა როგორც (Save As)"
                    >
                      <FilePlus size={14} />
                    </button>
                 </div>
              </div>

              <textarea
                ref={textareaRef}
                value={localCode}
                onChange={handleCodeChange}
                spellCheck={false}
                className="flex-1 w-full bg-transparent text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none custom-scrollbar leading-relaxed"
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-50 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between items-center">
          <span>ID: {snippet.id.slice(0, 8)}</span>
          <div className="flex gap-2">
            {isDirty && <span className="text-amber-600 font-medium">● შენახვა გჭირდებათ</span>}
            <span>{new Date(snippet.createdAt).toLocaleDateString('ka-GE')}</span>
          </div>
        </div>
      </div>

      {isFullScreen && createPortal(<FullScreenModal />, document.body)}
    </>
  );
};