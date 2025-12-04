import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface LanguageDropdownProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ currentLang, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'ka', label: 'KA' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200 transition-all backdrop-blur-sm"
      >
        <Globe size={14} className="text-indigo-600" />
        <span>{currentLang.toUpperCase()}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors ${currentLang === lang.code ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span>{lang.label}</span>
              {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};