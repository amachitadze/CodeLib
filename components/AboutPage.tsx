import React from 'react';
import { AboutSection } from './AboutSection';
import { Language } from '../types';
import { Code2, ArrowLeft } from 'lucide-react';
import { translations } from '../utils/translations';

interface AboutPageProps {
  onBack: () => void;
  onStart: () => void;
  lang: Language;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onStart, lang }) => {
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>
              
              <button onClick={onBack} className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Code2 size={24} />
                </div>
                <span className="text-xl font-bold text-white">
                  CodeLib
                </span>
              </button>
            </div>
            
            <button 
              onClick={onStart}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 active:scale-95 text-sm"
            >
              {t.nav_add}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1">
        <AboutSection lang={lang} />
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          {t.footer_text}
        </div>
      </footer>
    </div>
  );
};