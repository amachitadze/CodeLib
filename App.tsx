import React, { useState, useEffect } from 'react';
import { Snippet, SnippetType, ViewMode } from './types';
import { SnippetCard } from './components/SnippetCard';
import { AddSnippetModal } from './components/AddSnippetModal';
import { Plus, Search, Code2, LayoutGrid, Github, LayoutTemplate, Box, Layers, Grid3x3, Grid2x2, Rows } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'codelib_snippets';

// Initial data for demonstration
const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: '1',
    title: 'მბრუნავი ბარათი',
    description: 'CSS ტრანსფორმაცია hover ეფექტზე',
    type: 'component',
    createdAt: Date.now(),
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f9ff; font-family: sans-serif; margin: 0; }
  .card {
    width: 200px;
    height: 300px;
    perspective: 1000px;
  }
  .inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }
  .card:hover .inner {
    transform: rotateY(180deg);
  }
  .front, .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .front {
    background: linear-gradient(to right, #4f46e5, #ec4899);
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
  .back {
    background: white;
    color: #333;
    transform: rotateY(180deg);
    border: 2px solid #4f46e5;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="inner">
      <div class="front">მიიტანე მაუსი</div>
      <div class="back">გამარჯობა!</div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: '2',
    title: 'ნეონის ღილაკი',
    description: 'მნათობი ღილაკი',
    type: 'component',
    createdAt: Date.now() - 10000,
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
  .neon-btn {
    padding: 15px 30px;
    font-size: 20px;
    color: #03e9f4;
    text-transform: uppercase;
    text-decoration: none;
    letter-spacing: 4px;
    border: 2px solid #03e9f4;
    position: relative;
    overflow: hidden;
    transition: 0.2s;
    cursor: pointer;
    background: transparent;
    font-family: sans-serif;
  }
  .neon-btn:hover {
    color: #0f172a;
    background: #03e9f4;
    box-shadow: 0 0 10px #03e9f4, 0 0 40px #03e9f4, 0 0 80px #03e9f4;
  }
</style>
</head>
<body>
  <button class="neon-btn">Neon Button</button>
</body>
</html>`
  }
];

const App: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | SnippetType>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setSnippets(JSON.parse(stored));
      } catch (e) {
        setSnippets(INITIAL_SNIPPETS);
      }
    } else {
      setSnippets(INITIAL_SNIPPETS);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (snippets.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snippets));
    }
  }, [snippets]);

  const handleAddSnippet = (title: string, description: string, code: string, type: SnippetType) => {
    const newSnippet: Snippet = {
      id: crypto.randomUUID(),
      title,
      description,
      code,
      type,
      createdAt: Date.now(),
    };
    setSnippets([newSnippet, ...snippets]);
  };

  const handleUpdateSnippet = (id: string, newCode: string) => {
    setSnippets(snippets.map(s => s.id === id ? { ...s, code: newCode } : s));
  };

  const handleSaveAsSnippet = (originalId: string, newCode: string, newTitle: string) => {
    const original = snippets.find(s => s.id === originalId);
    if (original) {
      const newSnippet: Snippet = {
        ...original,
        id: crypto.randomUUID(),
        title: newTitle,
        code: newCode,
        createdAt: Date.now(),
      };
      setSnippets([newSnippet, ...snippets]);
    }
  };

  const handleDeleteSnippet = (id: string) => {
    if (confirm('ნამდვილად გსურთ კოდის წაშლა?')) {
      setSnippets(snippets.filter(s => s.id !== id));
    }
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  const getGridClass = () => {
    switch (viewMode) {
      case ViewMode.LIST:
        return 'grid-cols-1 max-w-4xl mx-auto';
      case ViewMode.LARGE_GRID:
        return 'grid-cols-1 md:grid-cols-2';
      case ViewMode.GRID:
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Code2 size={24} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                CodeLib
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                ყველა
              </button>
              <button 
                onClick={() => setFilterType('component')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'component' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                კომპონენტები
              </button>
              <button 
                onClick={() => setFilterType('website')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'website' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                საიტები
              </button>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">დამატება</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">ბიბლიოთეკა</h2>
              <p className="text-slate-500">
                {filterType === 'ALL' ? 'ყველა კოდი' : filterType === 'component' ? 'მხოლოდ კომპონენტები' : 'მხოლოდ ვებ-გვერდები'}. 
                {snippets.length} ელემენტი.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="hidden sm:flex bg-slate-100 rounded-lg p-1 gap-1">
                 <button 
                   onClick={() => setViewMode(ViewMode.GRID)} 
                   className={`p-2 rounded ${viewMode === ViewMode.GRID ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                   title="3 სვეტი"
                 >
                   <Grid3x3 size={18} />
                 </button>
                 <button 
                   onClick={() => setViewMode(ViewMode.LARGE_GRID)} 
                   className={`p-2 rounded ${viewMode === ViewMode.LARGE_GRID ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                   title="2 სვეტი"
                 >
                   <Grid2x2 size={18} />
                 </button>
                 <button 
                   onClick={() => setViewMode(ViewMode.LIST)} 
                   className={`p-2 rounded ${viewMode === ViewMode.LIST ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                   title="1 სვეტი"
                 >
                   <Rows size={18} />
                 </button>
               </div>

               <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ძებნა..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Filter */}
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border ${filterType === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
                <Layers size={14} className="inline mr-2" />
                ყველა
            </button>
             <button 
                onClick={() => setFilterType('component')}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border ${filterType === 'component' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
                <Box size={14} className="inline mr-2" />
                კომპონენტები
            </button>
            <button 
                onClick={() => setFilterType('website')}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border ${filterType === 'website' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
                <LayoutTemplate size={14} className="inline mr-2" />
                საიტები
            </button>
        </div>

        {/* Grid */}
        {filteredSnippets.length > 0 ? (
          <div className={`grid gap-6 ${getGridClass()}`}>
            {filteredSnippets.map((snippet) => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet} 
                onDelete={handleDeleteSnippet} 
                onUpdate={handleUpdateSnippet}
                onSaveAs={handleSaveAsSnippet}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <LayoutGrid size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">კოდები არ მოიძებნა</p>
            <p className="text-sm">დაამატეთ ახალი კოდი ღილაკზე დაჭერით</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center text-slate-400 text-sm">
          <p>© 2024 CodeLib. შექმნილია სიყვარულით.</p>
          <div className="flex gap-4">
            <Github size={18} className="hover:text-slate-600 cursor-pointer" />
          </div>
        </div>
      </footer>

      <AddSnippetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddSnippet}
      />
    </div>
  );
};

export default App;