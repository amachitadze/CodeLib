import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface TestimonialsSectionProps {
  lang: Language;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ lang }) => {
  const t = translations[lang];

  // Static reviews to maintain quality and avoid spam
  const reviews = [
    {
      id: 1,
      name: "Dato M.",
      role: "Frontend Developer",
      text: "საუკეთესო თულია ქართულ ინტერნეტ სივრცეში. კოდის შენახვა და გაზიარება არასდროს ყოფილა ასე მარტივი.",
      rating: 5,
      initial: "D",
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Mariam K.",
      role: "UI/UX Designer",
      text: "The Live Preview feature saves me hours of work. I can quickly test my animations without setting up a project.",
      rating: 5,
      initial: "M",
      color: "bg-purple-500"
    },
    {
      id: 3,
      name: "Giorgi S.",
      role: "Fullstack Dev",
      text: "ძალიან სუფთა და სწრაფი ინტერფეისი. AI გენერატორი კი ნამდვილი აღმოჩენაა დამწყებთათვის.",
      rating: 5,
      initial: "G",
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">{t.lp_reviews_title}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t.lp_reviews_subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <div className="flex-1 relative">
                <Quote className="absolute -top-2 -left-2 text-indigo-100 transform -scale-x-100" size={48} />
                <p className="text-slate-600 relative z-10 leading-relaxed italic">
                  "{review.text}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-50">
                <div className={`w-12 h-12 ${review.color} rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-100`}>
                  {review.initial}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{review.name}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};