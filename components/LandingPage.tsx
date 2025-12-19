
import React, { useState } from 'react';
import { Code2, Zap, Brain, Shield, Rocket, ArrowRight, Heart, Coffee, Bitcoin } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { TestimonialsSection } from './TestimonialsSection';

interface LandingPageProps {
  onStart: () => void;
  onAbout: () => void;
  lang: Language;
  langSwitcher?: React.ReactNode;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onAbout, lang, langSwitcher }) => {
  const t = translations[lang];
  const [showDonateModal, setShowDonateModal] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* Navbar - Ensured horizontal layout without overlaps */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Code2 size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                CodeLib
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setShowDonateModal(true)}
                className="hidden md:flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                <Heart size={18} />
                <span className="text-sm">{t.lp_donate_title}</span>
              </button>
              
              <button 
                onClick={onStart}
                className="bg-slate-900 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                {t.lp_start_btn.split(' ')[0]} {/* Shorter version for small screens if needed */}
              </button>
              
              {/* Language switcher placed to the right of the Start button */}
              {langSwitcher && <div className="shrink-0">{langSwitcher}</div>}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Rocket size={16} />
            <span>{t.lp_version}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {t.lp_hero_title_1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {t.lp_hero_title_2}
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {t.lp_hero_desc}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
            >
              {t.lp_start_btn}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features"
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              {t.lp_learn_more}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.lp_why_title}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              {t.lp_why_desc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="text-indigo-600" size={32} />,
                title: t.lp_feat_ai_title,
                desc: t.lp_feat_ai_desc
              },
              {
                icon: <Zap className="text-amber-500" size={32} />,
                title: t.lp_feat_preview_title,
                desc: t.lp_feat_preview_desc
              },
              {
                icon: <Shield className="text-green-500" size={32} />,
                title: t.lp_feat_local_title,
                desc: t.lp_feat_local_desc
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.lp_all_in_one}</h2>
              <p className="text-slate-500">{t.lp_save_any}</p>
            </div>
            <button onClick={onStart} className="text-indigo-600 font-medium flex items-center gap-1 mt-4 md:mt-0 hover:gap-2 transition-all">
              {t.lp_see_all} <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Components', 'Animations', 'Websites', 'Forms'].map((cat, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl aspect-video bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors" onClick={onStart}>
                 <span className="font-bold text-slate-700 text-lg z-10">{cat}</span>
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection lang={lang} />

      {/* Donation CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="mx-auto text-red-500 mb-6" size={48} fill="currentColor" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.lp_donate_title}</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            {t.lp_donate_desc}
          </p>
          <button 
            onClick={() => setShowDonateModal(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            <Coffee size={20} />
            {t.lp_donate_btn}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded text-white">
              <Code2 size={20} />
            </div>
            <span className="font-bold text-slate-900">CodeLib</span>
          </div>
          <div className="text-sm text-slate-500">
            {t.footer_text}
          </div>
          <div className="flex gap-6 text-slate-500 text-sm font-medium">
            <button onClick={onAbout} className="hover:text-indigo-600 transition-colors">
              {t.footer_about}
            </button>
            <a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Discord</a>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <Coffee size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{t.lp_donate_thanks}</h3>
              <p className="text-slate-500 text-sm mt-2">{t.lp_donate_choose}</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Coffee size={20} /></div>
                  <span className="font-medium text-slate-700">Buy Me a Coffee</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button className="w-full p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Bitcoin size={20} /></div>
                  <span className="font-medium text-slate-700">Crypto Transfer</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>

            <button 
              onClick={() => setShowDonateModal(false)}
              className="w-full mt-6 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-lg transition-colors"
            >
              {t.lp_close}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
