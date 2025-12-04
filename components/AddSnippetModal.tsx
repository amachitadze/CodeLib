import React, { useState } from 'react';
import { X, Sparkles, Loader2, Code as CodeIcon, LayoutTemplate, Box } from 'lucide-react';
import { generateCodeSnippet } from '../services/geminiService';
import { SnippetType } from '../types';

interface AddSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, code: string, type: SnippetType) => void;
}

export const AddSnippetModal: React.FC<AddSnippetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SnippetType>('component');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && code) {
      onSave(title, description, code, type);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCode('');
    setAiPrompt('');
    setType('component');
    onClose();
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const result = await generateCodeSnippet(aiPrompt, type);
      setTitle(result.title);
      setDescription(result.description);
      setCode(result.code);
    } catch (error) {
      setGenerationError("კოდის გენერირება ვერ მოხერხდა. სცადეთ თავიდან ან შეამოწმეთ API გასაღები.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ახალი კოდის დამატება</h2>
            <p className="text-slate-500 text-sm">აირჩიეთ ტიპი და დაამატეთ კოდი</p>
          </div>
          <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Input Form */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('component')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'component' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' 
                    : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <Box size={24} />
                <span className="text-sm font-medium">კომპონენტი</span>
              </button>
              <button
                type="button"
                onClick={() => setType('website')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  type === 'website' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' 
                    : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <LayoutTemplate size={24} />
                <span className="text-sm font-medium">მთლიანი საიტი</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">სათაური</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="მაგ: ლამაზი ღილაკი"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">აღწერა</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="მოკლე აღწერა..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">HTML/CSS კოდი</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="<div>Hello World</div>"
                className="flex-1 min-h-[200px] w-full p-4 bg-slate-900 text-slate-300 font-mono text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none custom-scrollbar resize-none"
              />
            </div>
          </div>

          {/* Right Column: AI Generator */}
          <div className="lg:w-1/3 bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 flex flex-col h-fit">
            <div className="flex items-center gap-2 mb-4 text-indigo-700">
              <Sparkles size={20} />
              <h3 className="font-semibold">AI ასისტენტი</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              არ იცით როგორ დაწეროთ კოდი? სთხოვეთ Gemini-ს და ის დაგიგენერირებთ მზა HTML-ს.
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`მაგალითად: შექმენი ${type === 'component' ? 'ღილაკი' : 'პორტფოლიო საიტი'}...`}
              className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] resize-none mb-4"
            />

            {generationError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-lg">
                {generationError}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  გენერირება...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  კოდის გენერირება
                </>
              )}
            </button>
            
            <div className="mt-4 pt-4 border-t border-indigo-100">
               <p className="text-[10px] text-indigo-400 text-center">
                 Powered by Google Gemini 2.5
               </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={resetForm}
            className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            გაუქმება
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !code}
            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md shadow-green-200 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
};