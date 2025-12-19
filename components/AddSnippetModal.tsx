import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Code as CodeIcon, LayoutTemplate, Box, Lock, Tag, FileText, Image as ImageIcon, ExternalLink, Download, Upload } from 'lucide-react';
import { generateCodeSnippet } from '../services/geminiService';
import { SnippetType, Language } from '../types';
import { translations } from '../utils/translations';
import { uploadImageToImgBB } from '../lib/imgbb';

interface AddSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, code: string, type: SnippetType, category: string, instruction: string, imageUrl?: string, demoUrl?: string, downloadUrl?: string) => void;
  existingCategories: string[];
  lang: Language;
}

const DEFAULT_CATEGORIES = {
  component: {
    ka: ['ღილაკები', 'ბარათები', 'ფორმები', 'ნავიგაცია', 'ანიმაციები', 'სხვა'],
    en: ['Buttons', 'Cards', 'Forms', 'Navigation', 'Animations', 'Other'],
    es: ['Botones', 'Tarjetas', 'Formularios', 'Navegación', 'Animaciones', 'Otro']
  },
  website: {
    ka: ['პორტფოლიო', 'ლენდინგ გვერდი', 'ბლოგი', 'E-commerce', 'ბიზნესი', 'სხვა'],
    en: ['Portfolio', 'Landing Page', 'Blog', 'E-commerce', 'Business', 'Other'],
    es: ['Portafolio', 'Página de Destino', 'Blog', 'Comercio Electrónico', 'Negocios', 'Otro']
  },
  template: {
    ka: ['Portfolio', 'Business', 'SaaS', 'Personal', 'E-commerce', 'სხვა'],
    en: ['Portfolio', 'Business', 'SaaS', 'Personal', 'E-commerce', 'Other'],
    es: ['Portafolio', 'Negocios', 'SaaS', 'Personal', 'E-commerce', 'Otro']
  }
};

export const AddSnippetModal: React.FC<AddSnippetModalProps> = ({ isOpen, onClose, onSave, existingCategories, lang }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SnippetType>('component');
  const [category, setCategory] = useState('');
  const [password, setPassword] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Template specific states
  const [imageUrl, setImageUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (!category) {
      setCategory(DEFAULT_CATEGORIES[type][lang][0]);
    }
  }, [type, lang]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageToImgBB(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      alert("Image upload failed. Please check your API key.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appPassword = (import.meta as any).env?.VITE_APP_PASSWORD;

    if (password !== appPassword) {
      setPasswordError(true);
      return;
    }

    if (title && (code || type === 'template') && category) {
      onSave(title, description, code, type, category, instruction, imageUrl, demoUrl, downloadUrl);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setInstruction('');
    setCode('');
    setAiPrompt('');
    setPassword('');
    setImageUrl('');
    setDemoUrl('');
    setDownloadUrl('');
    setPasswordError(false);
    setType('component');
    setCategory('');
    onClose();
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const result = await generateCodeSnippet(aiPrompt, type, lang);
      setTitle(result.title);
      setDescription(result.description);
      setCode(result.code);
    } catch (error) {
      setGenerationError(t.ai_error);
    } finally {
      setIsGenerating(false);
    }
  };

  const availableCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES[type][lang],
    ...existingCategories
  ]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t.add_title}</h2>
            <p className="text-slate-500 text-sm">{t.add_subtitle}</p>
          </div>
          <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 flex flex-col gap-5">
            {/* Type Selection */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('component')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'component' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}
              >
                <Box size={20} />
                <span className="text-xs font-medium">{t.add_type_component}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('website')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'website' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}
              >
                <LayoutTemplate size={20} />
                <span className="text-xs font-medium">{t.add_type_website}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('template')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'template' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}
              >
                <ImageIcon size={20} />
                <span className="text-xs font-medium">{t.add_type_template}</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.add_input_title}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.add_placeholder_title}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.add_input_category}</label>
                  <div className="relative">
                    <input
                      type="text"
                      list="category-suggestions"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder={t.add_placeholder_category}
                      className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <Tag size={16} className="absolute left-3 top-3 text-slate-400" />
                    <datalist id="category-suggestions">
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.add_input_desc}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.add_placeholder_desc}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Template Specific Fields */}
            {type === 'template' && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.add_input_image}</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {isUploading ? t.add_uploading : t.add_input_image}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {imageUrl && (
                      <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <ExternalLink size={14} /> {t.add_input_demo}
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://demo.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Download size={14} /> {t.add_input_download}
                    </label>
                    <input
                      type="url"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {(type !== 'template' || code) && (
              <div className="flex-1 flex flex-col min-h-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.add_input_code}</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="<div>Hello World</div>"
                  className="flex-1 w-full p-4 bg-slate-900 text-slate-300 font-mono text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none custom-scrollbar resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                 {t.add_input_instruction}
                 <FileText size={14} className="text-slate-400" />
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={t.add_placeholder_instruction}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20 resize-none text-sm"
              />
            </div>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 flex flex-col h-fit">
                <div className="flex items-center gap-2 mb-4 text-indigo-700">
                  <Sparkles size={20} />
                  <h3 className="font-semibold">{t.add_ai_title}</h3>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">{t.add_ai_desc}</p>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={type === 'component' ? t.add_ai_placeholder_comp : t.add_ai_placeholder_web}
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] resize-none mb-4"
                />

                {generationError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-lg">{generationError}</div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiPrompt}
                  type="button"
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isGenerating ? (
                      <><Loader2 size={18} className="animate-spin" /> {t.add_ai_generating}</>
                  ) : (
                      <><Sparkles size={18} /> {t.add_ai_btn}</>
                  )}
                </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-700">
                   <Lock size={16} />
                   <h3 className="font-semibold text-sm">{t.add_security}</h3>
                </div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                    }}
                    placeholder={t.add_password_placeholder}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all ${passwordError ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                />
                {passwordError && <p className="text-xs text-red-500 mt-1">{t.add_password_error}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={resetForm} type="button" className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            {t.add_cancel}
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            disabled={!title || isUploading}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50 transition-all"
          >
            {t.add_save}
          </button>
        </div>
      </div>
    </div>
  );
};