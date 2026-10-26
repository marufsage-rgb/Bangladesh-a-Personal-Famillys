/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PhoneCall, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  PhoneForwarded,
  PhoneOff,
  Volume2
} from 'lucide-react';
import { GovtHotline, AppLanguage } from '../types';
import { BANGLADESH_GOVT_HOTLINES, CITIZEN_GUIDES } from '../services/bangladeshGovtData';

interface HotlinesViewProps {
  lang: AppLanguage;
}

export const HotlinesView: React.FC<HotlinesViewProps> = ({ lang }) => {
  const [selectedHotline, setSelectedHotline] = useState<GovtHotline | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [activeGuideTab, setActiveGuideTab] = useState<string>('mutation_guide');

  const startCallSimulation = (hl: GovtHotline) => {
    setSelectedHotline(hl);
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
    }, 1800);
  };

  const endCallSimulation = () => {
    setCallStatus('idle');
    setSelectedHotline(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-red-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-rose-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'bn' ? 'বাংলাদেশ সরকার জরুরি ও নাগরিক সেবা হটলাইন' : 'Bangladesh Emergency & Citizen Call Centers'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
            {lang === 'bn' ? 'সরকারি হটলাইন ডিরেক্টরি ও তাৎক্ষণিক সেবা গাইড' : 'Government Hotline Directory & Step-by-Step Guides'}
          </h2>
          <p className="text-rose-100/80 text-xs md:text-sm mt-2 leading-relaxed">
            {lang === 'bn' 
              ? 'ভূমি সংক্রান্ত বিরোধ বা নামজারির জন্য ১৬১২২, জরুরি সহায়তায় ৯৯৯, সরকারি সেবা তথ্যে ৩৩৩ এবং যেকোনো অনিয়ম বা ঘুষ দাবির বিরুদ্ধে ১০৬ এ সরাসরি যোগাযোগের ব্যবস্থা।'
              : 'Direct connection to 16122 for Land Services, 999 for National Emergencies, 333 for Citizen Inquiries, and 106 for Anti-Corruption.'}
          </p>
        </div>
      </div>

      {/* Hotlines Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>{lang === 'bn' ? 'জরুরি হেল্পলাইন নম্বরসমূহ (সরাসরি ক্লিক করে কল করুন)' : 'Essential Republic Hotlines'}</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? '৯টি জাতীয় হটলাইন নিবন্ধিত' : '9 National Hotlines'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BANGLADESH_GOVT_HOTLINES.map(hl => (
            <div 
              key={hl.number}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    {hl.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{hl.timing}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white font-mono font-bold text-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {hl.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white leading-tight">
                      {lang === 'bn' ? hl.titleBn : hl.titleEn}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {hl.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {lang === 'bn' ? hl.descriptionBn : hl.descriptionEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={hl.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{lang === 'bn' ? 'সরকারি পোর্টাল' : 'Official Portal'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => startCallSimulation(hl)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'কল করুন' : 'Call'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Legal Guides & Checklists */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'bn' ? 'বাংলাদেশ সরকারি নাগরিক সেবা রূপরেখা ও আইন নির্দেশিকা' : 'Official Republic Citizen Service Roadmaps'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn' ? 'দালাল ও অতিরিক্ত খরচ এড়িয়ে সরাসরি সঠিক সরকারি অফিসে কাজ সম্পাদনের রোডম্যাপ' : 'Step-by-step risk-free instructions with official government fees'}
            </p>
          </div>
        </div>

        {/* Guide Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {CITIZEN_GUIDES.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGuideTab(g.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeGuideTab === g.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {lang === 'bn' ? g.titleBn : g.titleEn}
            </button>
          ))}
        </div>

        {/* Selected Guide Details */}
        {(() => {
          const guide = CITIZEN_GUIDES.find(g => g.id === activeGuideTab) || CITIZEN_GUIDES[0];
          return (
            <div className="mt-6 space-y-6">
              
              {/* Fee & Duration Alert Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {lang === 'bn' ? 'অফিসিয়াল সরকারি ফি' : 'Official Government Fee'}
                  </div>
                  <div className="text-xs md:text-sm text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">
                    {guide.officialGovtFee}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50">
                  <div className="text-xs font-bold text-teal-800 dark:text-teal-300">
                    {lang === 'bn' ? 'প্রত্যাশিত সময়সীমা ও পোর্টাল' : 'Duration & Portal'}
                  </div>
                  <div className="text-xs md:text-sm text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">
                    {guide.expectedDuration}
                  </div>
                  <a 
                    href={guide.keyPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline mt-1"
                  >
                    <span>{guide.keyPortal}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step by Step Roadmap */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  {lang === 'bn' ? 'ধাপে ধাপে সম্পন্ন করার রোডম্যাপ (Step-by-Step Roadmap):' : 'Step-by-Step Procedure:'}
                </h4>
                <div className="space-y-2.5">
                  {guide.stepsBn.map((step, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-start space-x-3 text-xs md:text-sm"
                    >
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-200 leading-relaxed font-bangla">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  {lang === 'bn' ? 'প্রয়োজনীয় কাগজপত্রের তালিকা (Required Documents):' : 'Required Documents:'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {guide.requiredDocsBn.map((doc, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Risk Warning */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 space-y-2">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'bn' ? 'আইনি ঝুঁকি ও সতর্কতা (Legal Risk Mitigation):' : 'Legal Warnings & Risk Avoidance:'}</span>
                </div>
                <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                  {guide.riskWarningsBn.map((rw, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{rw}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          );
        })()}

      </div>

      {/* Interactive Hotline Call Modal */}
      {selectedHotline && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full border border-slate-700 shadow-2xl p-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-600 mx-auto flex items-center justify-center text-3xl font-mono font-bold shadow-lg shadow-rose-900/50 animate-bounce">
              {selectedHotline.number}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
                {callStatus === 'calling' ? (lang === 'bn' ? 'সংযোগ স্থাপন করা হচ্ছে...' : 'Connecting...') : (lang === 'bn' ? 'কল সক্রিয় (সিমুলেশন)' : 'Call Connected')}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {lang === 'bn' ? selectedHotline.titleBn : selectedHotline.titleEn}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedHotline.category} • {selectedHotline.timing}
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl text-left text-xs space-y-2 border border-slate-700">
              <span className="font-bold text-emerald-400 block">
                {lang === 'bn' ? 'কথা বলার আগে প্রস্তুত রাখুন:' : 'Keep ready before speaking:'}
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• আপনার ১৭ বা ১০ ডিজিট স্মার্ট এনআইডি কার্ড</li>
                <li>• জমির দাগ নং, খতিয়ান নং ও মৌজা নাম (ভূমি সেবার ক্ষেত্রে)</li>
                <li>• ঘটনার সঠিক স্থান ও মোবাইল নম্বর</li>
              </ul>
            </div>

            <button
              onClick={endCallSimulation}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/50"
            >
              <PhoneOff className="w-5 h-5" />
              <span>{lang === 'bn' ? 'কল সমাপ্ত করুন' : 'End Call'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
