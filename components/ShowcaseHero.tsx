/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FamilyMember, AppLanguage } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  Key, 
  MapPin, 
  FileText, 
  HardDrive, 
  Bot, 
  Crown,
  Lock,
  Unlock,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';

interface ShowcaseHeroProps {
  currentUser: FamilyMember;
  lang: AppLanguage;
  isBiometricUnlocked: boolean;
  isDriveConnected: boolean;
  driveUserEmail?: string;
  docCount: number;
  passwordCount: number;
  addressCount: number;
  onOpenBiometrics: () => void;
  onOpenProfileEdit: () => void;
  onOpenGeniusManager: () => void;
  onOpenGoogleDrive: () => void;
}

export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({
  currentUser,
  lang,
  isBiometricUnlocked,
  isDriveConnected,
  driveUserEmail,
  docCount,
  passwordCount,
  addressCount,
  onOpenBiometrics,
  onOpenProfileEdit,
  onOpenGeniusManager,
  onOpenGoogleDrive
}) => {
  const isBn = lang === 'bn';
  const coverUrl = currentUser.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
  const headline = currentUser.showcaseHeadline || (isBn ? 'মারুফের পরিবার ডিজিটাল দুর্গ ও এআই ল্যাব' : 'Maruf Family Digital Enclave & AI Lab');
  const bio = currentUser.showcaseBio || (isBn 
    ? 'মরহুম বাবা আব্দুল বারিক ভূঁইয়ার ঐতিহ্য, পৈতৃক দলিলপত্র ও পরিবারের গোপনীয় নথিসমূহের শতভাগ নিরাপদ ভাণ্ডার।' 
    : 'Honoring Late Abdul Barek Bhuyan. Private high-security digital heritage vault and AI assistance for the Maruf Family.');

  const fontStyleClass = currentUser.showcaseFont === 'serif' 
    ? 'font-serif' 
    : currentUser.showcaseFont === 'display' 
    ? 'font-mono tracking-tight' 
    : 'font-sans';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl mb-8 transition-all">
      {/* Background Showcase Photo with Luxury Vignette */}
      <div className="absolute inset-0 z-0">
        <img 
          src={coverUrl} 
          alt="Family Showcase Backdrop" 
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 filter blur-[1px] transition-transform duration-1000 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Avatar & Showcase Identity */}
          <div className="flex items-start md:items-center gap-5">
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl ring-4 ring-emerald-500/40 shadow-xl overflow-hidden bg-slate-800">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'} 
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onOpenProfileEdit}
                title={isBn ? 'ছবি ও প্রোফাইল কাস্টমাইজ করুন' : 'Edit Showcase & Profile'}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  {currentUser.role === 'admin' ? (isBn ? 'পরিবার প্রধান ও এডমিন' : 'Family Head & Admin') : (isBn ? 'অনুমোদিত সদস্য' : 'Family Member')}
                </span>

                <button 
                  onClick={onOpenBiometrics}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isBiometricUnlocked 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  {isBiometricUnlocked ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                  {isBiometricUnlocked ? (isBn ? 'বায়োমেট্রিক সেশন সক্রিয়' : 'Biometric Active') : (isBn ? 'ভল্ট লকড (ক্লিক করে আনলক)' : 'Locked (Click to Unlock)')}
                </button>

                {isDriveConnected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    <HardDrive className="w-3 h-3 text-blue-400" />
                    Google Drive
                  </span>
                )}
              </div>

              <h1 className={`text-2xl md:text-3xl font-extrabold text-white tracking-wide ${fontStyleClass}`}>
                {isBn ? (currentUser.nameBn || currentUser.name) : currentUser.name}
              </h1>
              <p className="text-sm md:text-base text-emerald-400/90 font-medium mt-0.5">
                {headline}
              </p>
              <p className="text-xs md:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
                {bio}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Hub */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Genius Manager Button */}
            <button
              onClick={onOpenGeniusManager}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs md:text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>{isBn ? 'জিনিয়াস ম্যানেজার এআই' : 'Genius Helping Manager'}</span>
            </button>

            {/* Google Drive Hub Button */}
            <button
              onClick={onOpenGoogleDrive}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold border transition-all ${
                isDriveConnected 
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30' 
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <HardDrive className={`w-4 h-4 ${isDriveConnected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{isDriveConnected ? (isBn ? 'ড্রাইভ ফাইল ব্রাউজার' : 'Drive Files') : (isBn ? 'গুগল ড্রাইভ কানেক্ট' : 'Connect Drive')}</span>
            </button>

            {/* Customize Showcase */}
            <button
              onClick={onOpenProfileEdit}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs md:text-sm font-medium border border-slate-700/80 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isBn ? 'কাস্টমাইজ' : 'Customize'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{docCount}</div>
              <div className="text-slate-400">{isBn ? 'সুরক্ষিত মূল দলিল ও নথি' : 'Secured Documents'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{passwordCount}</div>
              <div className="text-slate-400">{isBn ? 'এনক্রিপ্টেড পাসওয়ার্ড ও পিন' : 'Locker Passwords'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{addressCount}</div>
              <div className="text-slate-400">{isBn ? 'পৈতৃক ভিটা ও জরুরি ঠিকানা' : 'Family Addresses'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-sm">
                {isBiometricUnlocked ? (isBn ? 'আনলকড' : 'Active') : (isBn ? 'সুরক্ষিত' : 'Locked')}
              </div>
              <div className="text-slate-400">{isBn ? 'বায়োমেট্রিক ও WebAuthn' : 'Biometric Security'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
