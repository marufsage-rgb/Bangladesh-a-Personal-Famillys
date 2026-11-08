/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NewsHeadline, AppLanguage } from '../types';
import { NewsService } from '../services/newsService';
import { Globe, Volume2, ChevronLeft, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';

interface WorldNewsTickerProps {
  lang: AppLanguage;
}

export const WorldNewsTicker: React.FC<WorldNewsTickerProps> = ({ lang }) => {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      const news = await NewsService.fetchWorldNews();
      setHeadlines(news);
      setIsLoading(false);
    };
    loadNews();

    // Refresh news every 30 minutes
    const interval = setInterval(loadNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % headlines.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + headlines.length) % headlines.length);
  };

  const handleSpeak = () => {
    if (headlines.length === 0) return;
    setIsSpeaking(true);
    NewsService.speakHeadline(headlines[currentIndex], lang);
    
    // Reset speaking state after a while (rough estimation)
    setTimeout(() => setIsSpeaking(false), 8000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center justify-center space-x-3">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">Fetching World Headlines...</span>
      </div>
    );
  }

  const current = headlines[currentIndex];

  return (
    <div className="relative group overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-emerald-900/30 rounded-2xl shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-stretch min-h-[80px]">
        {/* News Label */}
        <div className="bg-emerald-600 px-4 flex items-center justify-center space-x-2 shrink-0 md:w-40 py-3 md:py-0">
          <Globe className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white font-bold text-xs uppercase tracking-wider">
            {lang === 'bn' ? 'বিশ্ব সংবাদ' : 'World News'}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row items-center px-4 py-3 md:py-0 overflow-hidden">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter bg-emerald-400/10 px-1.5 py-0.5 rounded">
                Headline {currentIndex + 1}/10
              </span>
              {current?.isHighPriority && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-tighter bg-amber-400/10 px-1.5 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" />
                  Flash
                </span>
              )}
              <span className="text-[10px] text-slate-500 font-medium">
                {current?.source} • {new Date(current?.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <h4 className="text-white font-bold text-sm md:text-base leading-tight truncate md:whitespace-normal md:line-clamp-1 group-hover:text-emerald-300 transition-colors">
              {lang === 'bn' ? current?.titleBn : current?.title}
            </h4>
            <p className="hidden md:block text-slate-400 text-xs line-clamp-1 mt-0.5">
              {current?.summary}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 mt-3 md:mt-0 ml-0 md:ml-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
            <button 
              onClick={handleSpeak}
              className={`p-2 rounded-xl transition-all ${isSpeaking ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-slate-800 rounded-xl p-1 space-x-1">
              <button 
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/30 w-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / headlines.length) * 100}%` }} 
        />
      </div>
    </div>
  );
};
