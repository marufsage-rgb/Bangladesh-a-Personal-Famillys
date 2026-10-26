/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Shield, 
  FolderLock, 
  Bot, 
  PhoneCall, 
  Sliders, 
  Lock, 
  Globe, 
  Moon, 
  Sun, 
  UserCheck, 
  Sparkles,
  AlertCircle,
  Fingerprint,
  Unlock,
  Camera,
  UserCog
} from 'lucide-react';
import { FamilyMember, AppTheme, AppLanguage } from '../types';

interface NavbarProps {
  currentTab: 'vault' | 'advisor' | 'hotlines' | 'lab' | 'admin';
  setCurrentTab: (tab: 'vault' | 'advisor' | 'hotlines' | 'lab' | 'admin') => void;
  currentUser: FamilyMember;
  onSwitchUser: () => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  pendingRequestsCount: number;
  isBiometricUnlocked: boolean;
  onToggleBiometricLock: () => void;
  onEditProfile?: () => void;
  isDriveConnected?: boolean;
  onOpenGoogleDrive?: () => void;
  onOpenGeniusManager?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onSwitchUser,
  lang,
  setLang,
  theme,
  setTheme,
  isDarkMode,
  setIsDarkMode,
  pendingRequestsCount,
  isBiometricUnlocked,
  onToggleBiometricLock,
  onEditProfile,
  isDriveConnected = false,
  onOpenGoogleDrive,
  onOpenGeniusManager,
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'co_admin';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Top Banner with Security & Identity Assurance */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2 container mx-auto">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold tracking-wide">
            {lang === 'bn' 
              ? 'মারুফের পরিবার - একান্ত পারিবারিক সুরক্ষিত ডিজিটাল ভল্ট ও নাগরিক আইন ল্যাব' 
              : "Maruf's Family - Exclusive Protected Digital Vault & Citizen Legal Lab"}
          </span>
          <span className="hidden md:inline text-emerald-200/80">|</span>
          <span className="hidden md:inline text-emerald-200/90 text-[11px]">
            {lang === 'bn' ? 'হোস্ট ও ব্যাকআপ: গুগল ড্রাইভ • গিটহাব • ফায়ারবেস • এআই স্টুডিও' : 'Host & Sync: Google Drive • GitHub • Firebase • AI Studio'}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] shrink-0">
          <span className="inline-flex items-center gap-1 bg-emerald-700/50 px-2 py-0.5 rounded text-emerald-100">
            <Lock className="w-3 h-3 text-emerald-300" />
            <span>256-Bit SSL Enclave</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Family Seal */}
          <div 
            onClick={() => setCurrentTab('vault')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-amber-600 p-0.5 shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-bold text-lg md:text-xl text-slate-900 dark:text-white leading-tight tracking-tight">
                  {lang === 'bn' ? 'মারুফের পরিবার' : "Maruf's Family"}
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Vault & Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'মরহুম বাবা আব্দুল বারিক ভূঁইয়া উত্তরাধিকার ও পারিবারিক আর্কাইভ' : 'Late Abdul Barek Bhuyan Heritage & Family Archive'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setCurrentTab('vault')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                currentTab === 'vault'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderLock className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'bn' ? 'পারিবারিক ভল্ট' : 'Family Vault'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('advisor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                currentTab === 'advisor'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-teal-500" />
              <span>{lang === 'bn' ? 'নাগরিক এআই উপদেষ্টা' : 'Citizen AI Advisor'}</span>
              <span className="px-1 py-0.2 text-[9px] bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded font-mono">
                Gemini 3.8
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('hotlines')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                currentTab === 'hotlines'
                  ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-rose-500" />
              <span>{lang === 'bn' ? 'সরকারি হটলাইন (৯৯৯/১৬১২২)' : 'Govt Hotlines'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('lab')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                currentTab === 'lab'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{lang === 'bn' ? 'এআই ল্যাব ও এপিআই' : 'AI Lab & APIs'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>{lang === 'bn' ? 'এডমিন ও ব্যাকআপ' : 'Admin & Backup'}</span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Controls: Drive, Genius, Language, Theme, User Profile */}
          <div className="flex items-center space-x-1.5 md:space-x-2">
            
            {/* Genius Manager Agent Launch Button */}
            {onOpenGeniusManager && (
              <button
                onClick={onOpenGeniusManager}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                title={lang === 'bn' ? 'জিনিয়াস হেল্পিং ম্যানেজার চালু করুন' : 'Launch Genius Helping Manager'}
              >
                <Bot className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'জিনিয়াস' : 'Genius'}</span>
              </button>
            )}

            {/* Google Drive Status & Explorer Button */}
            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isDriveConnected
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-blue-500'
                }`}
                title="Google Drive Sync & Explorer"
              >
                <span className="text-xs">📁</span>
                <span className="hidden md:inline">Drive</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              title="Toggle Language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Biometric Shield Lock/Unlock Button */}
            <button
              onClick={onToggleBiometricLock}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isBiometricUnlocked
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
              }`}
              title={isBiometricUnlocked ? 'Biometric Unlocked (Click to lock vault)' : 'Biometric Locked (Click to scan fingerprint)'}
            >
              <Fingerprint className={`w-3.5 h-3.5 ${isBiometricUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`} />
              <span className="hidden md:inline">
                {isBiometricUnlocked ? (lang === 'bn' ? 'আনলকড' : 'Unlocked') : (lang === 'bn' ? 'লকড' : 'Locked')}
              </span>
            </button>

            {/* Active User Switcher Badge */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onSwitchUser}
                className="flex items-center space-x-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 transition-all text-left"
                title="Click to switch active family member view"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name[0]
                  )}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-semibold text-slate-900 dark:text-emerald-100 flex items-center gap-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[9px] bg-amber-500 text-white font-bold px-1 rounded">ADMIN</span>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate max-w-[110px]">
                    {currentUser.role === 'admin' ? 'হাবিবুর রহমান মারুফ' : currentUser.relationship}
                  </div>
                </div>
              </button>

              {onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all"
                  title={lang === 'bn' ? 'ছবি ও প্রোফাইল এডিট করুন' : 'Edit Profile & Picture'}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 mt-1 border-t border-slate-200 dark:border-slate-800 scrollbar-none text-xs">
          <button
            onClick={() => setCurrentTab('vault')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentTab === 'vault' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'bn' ? 'পারিবারিক ভল্ট' : 'Vault'}
          </button>
          <button
            onClick={() => setCurrentTab('advisor')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentTab === 'advisor' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'bn' ? 'এআই উপদেষ্টা' : 'AI Advisor'}
          </button>
          <button
            onClick={() => setCurrentTab('hotlines')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentTab === 'hotlines' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'bn' ? 'হটলাইন (৯৯৯/১৬১২২)' : 'Hotlines'}
          </button>
          <button
            onClick={() => setCurrentTab('lab')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentTab === 'lab' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'bn' ? 'এআই ল্যাব' : 'AI Lab'}
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              currentTab === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {lang === 'bn' ? 'এডমিন প্যানেল' : 'Admin'}
          </button>
        </div>
      </div>
    </header>
  );
};
