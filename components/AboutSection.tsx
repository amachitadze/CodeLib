import React from 'react';
import { Code2, Mail, Users, Lightbulb } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface AboutSectionProps {
  lang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="py-24 bg-slate-900 text-slate-300 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-indigo-500/20">
              <Code2 size={16} />
              <span>{t.about_title}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
              {t.about_mission_title}
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 bg-slate-800 p-2 rounded-lg h-fit">
                  <Lightbulb className="text-yellow-400" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">{t.app_name}</h4>
                  <p className="leading-relaxed text-slate-400">
                    {t.about_mission_desc}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 bg-slate-800 p-2 rounded-lg h-fit">
                  <Users className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-2">{t.about_author_title}</h4>
                  <p className="leading-relaxed text-slate-400">
                    {t.about_author_desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact / Developer Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-30 transform rotate-1"></div>
            <div className="bg-[#1e1e1e] border border-slate-700 rounded-2xl p-8 relative shadow-2xl font-mono">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-xs text-slate-500">contact_info.json</span>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex">
                  <span className="text-purple-400 w-24">"project":</span>
                  <span className="text-green-400">"CodeLib v2.0"</span>,
                </div>
                <div className="flex">
                  <span className="text-purple-400 w-24">"author":</span>
                  <span className="text-green-400">"Resource AVMA"</span>,
                </div>
                <div className="flex">
                  <span className="text-purple-400 w-24">"status":</span>
                  <span className="text-green-400">"Open Source"</span>,
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 w-24 shrink-0">"contact":</span>
                  <div>
                    <span className="text-slate-500">{'{'}</span>
                    <div className="pl-4 py-1">
                      <span className="text-blue-400">"email"</span>: <a href={`mailto:${t.about_email}`} className="text-orange-300 hover:underline">{`"${t.about_email}"`}</a>
                    </div>
                    <span className="text-slate-500">{'}'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-slate-400 text-sm mb-4 font-sans">{t.about_contact_title}</h4>
                <a 
                  href={`mailto:${t.about_email}`}
                  className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg transition-all border border-slate-600 group font-sans"
                >
                  <Mail size={18} className="group-hover:text-indigo-400 transition-colors" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};