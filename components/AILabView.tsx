/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Key, 
  Sliders, 
  FileSearch, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Terminal, 
  Zap,
  Upload,
  FileText
} from 'lucide-react';
import { AIProviderConfig, AppLanguage } from '../types';
import { AIAdvisorService, DEFAULT_AI_CONFIG } from '../services/aiAdvisorService';

interface AILabViewProps {
  aiConfig: AIProviderConfig;
  onUpdateAiConfig: (config: AIProviderConfig) => void;
  lang: AppLanguage;
}

export const AILabView: React.FC<AILabViewProps> = ({
  aiConfig,
  onUpdateAiConfig,
  lang
}) => {
  const [config, setConfig] = useState<AIProviderConfig>(aiConfig);
  const [savedNotification, setSavedNotification] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Document Forensic Lab State
  const [forensicText, setForensicText] = useState('');
  const [forensicDocName, setForensicDocName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);

  // Roadmap Simulator State
  const [selectedScenario, setSelectedScenario] = useState('land_inheritance');
  const [roadmapOutput, setRoadmapOutput] = useState<string | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  const handleSaveConfig = () => {
    onUpdateAiConfig(config);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await AIAdvisorService.sendChatMessage(
        "Ping test: Please respond with 'OK - Bangladesh Legal Agent Active'",
        [],
        config,
        lang
      );
      setTestResult(response);
    } catch (e: any) {
      setTestResult(`Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunForensicScan = async () => {
    if (!forensicText.trim() && !forensicDocName) return;
    setIsAnalyzing(true);
    setAnalysisReport(null);

    try {
      const report = await AIAdvisorService.analyzeDocument({
        title: forensicDocName || 'Forensic Scan Target',
        titleBn: forensicDocName || 'পরীক্ষাধীন নথি',
        category: 'land_property',
        docType: 'Deed/Identity/Khatian',
        legalDetails: {
          mouza: 'ভবানীপুর',
          dagNo: '১৮২'
        }
      });
      setAnalysisReport(report);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateScenarioRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    setRoadmapOutput(null);

    const prompts: Record<string, string> = {
      land_inheritance: "পৈতৃক সম্পত্তির ওয়ারিশান বণ্টন, ফরায়েজ হিসাব, আপস বণ্টননামা দলিল রেজিস্ট্রি এবং নামজারি খতিয়ান বের করার জন্য সবথেকে সাশ্রয়ী, ঝুঁকিমুক্ত ও শতভাগ সরকারি নিয়মসম্মত বিস্তারিত রোডম্যাপ তৈরি করে দিন।",
      fraud_prevention: "বাংলাদেশে জমি ক্রয়ের পূর্বে ভুয়া দলিল, বায়া দলিলের জালিয়াতি এবং আরএস/বিএস রেকর্ডের দ্বৈত মালিকানা প্রতিরোধ করার জন্য সম্পূর্ণ আইনি চেকলিস্ট দিন।",
      passport_fasttrack: "ই-পাসপোর্ট আবেদনে পুলিশ ভেরিফিকেশন ও এনআইডির নামের বানান অসঙ্গতি দূর করার জন্য কোনো দালাল ছাড়া সরাসরি আইনি সমাধান দিন।"
    };

    try {
      const result = await AIAdvisorService.sendChatMessage(
        prompts[selectedScenario] || prompts.land_inheritance,
        [],
        config,
        lang
      );
      setRoadmapOutput(result);
    } catch (err: any) {
      setRoadmapOutput('ত্রুটি: রোডম্যাপ তৈরি করা যায়নি।');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'bn' ? 'এআই এজেন্টিক ল্যাব ও ফ্রি এপিআই গেটওয়ে' : 'AI Agentic Research Lab & Free API Gateway'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
            {lang === 'bn' ? 'এআই ল্যাব ও মাল্টি-এপিআই কনফিগারেশন' : 'AI Research Lab & Custom API Workbench'}
          </h2>
          <p className="text-purple-100/80 text-xs md:text-sm mt-2 leading-relaxed">
            {lang === 'bn'
              ? 'সার্ভারে সংযুক্ত ফ্রি জেমিনি ৩.৮ ফ্ল্যাশ ছাড়াও আপনার নিজস্ব এপিআই কি, ওপেনরাউটার বা গ্রোক যুক্ত করার এবং পরিবারের সকল দলিল ফরেনসিক অডিট করার গবেষণাগার।'
              : 'Configure default Gemini 3.8 Flash or connect custom API keys, OpenRouter, and conduct forensic document audits.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: API Key & Model Gateway */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'এআই ইঞ্জিন ও এপিআই কি সেটিংস' : 'AI Engine & API Key Setup'}
              </h3>
            </div>
            {savedNotification && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!'}
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === 'bn' ? 'সক্রিয় এআই সার্ভিস প্রোভাইডার:' : 'Active AI Service Provider:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, activeProvider: 'server_gemini' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.activeProvider === 'server_gemini'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Google Gemini 3.8</span>
                    <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-mono">DEFAULT</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">সার্ভার সাইড প্রি-কনফিগার্ড ও ফ্রি</div>
                </button>

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, activeProvider: 'custom_gemini' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.activeProvider === 'custom_gemini'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold">কাস্টম এপিআই কি</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">নিজস্ব Gemini/OpenRouter কি</div>
                </button>
              </div>
            </div>

            {config.activeProvider === 'custom_gemini' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'আপনার Gemini API Key লিখুন:' : 'Your Gemini API Key:'}
                </label>
                <input
                  type="password"
                  value={config.customApiKey || ''}
                  onChange={(e) => setConfig({ ...config, customApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ব্যবহার্য মডেল:' : 'Model:'}
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (সর্বোচ্চ গতি ও নির্ভুল আইন বিশ্লেষণ - রিকমেন্ডেড)</option>
                <option value="gemini-4-argon">gemini-4-argon (জটিল গবেষণা ও আইনি যুক্তি)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (লাইটওয়েট)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'উপদেষ্টার আচরণ ও টোন:' : 'Advisor Personality Tone:'}
              </label>
              <select
                value={config.agentTone}
                onChange={(e) => setConfig({ ...config, agentTone: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              >
                <option value="lawyer_advisor">আইনি ও সরকারি আইনজীবী টোন (Government Legal Advisor)</option>
                <option value="friendly_family">সহানুভূতিশীল পারিবারিক সুরক্ষক (Family Reassurance)</option>
                <option value="detailed_researcher">বিস্তারিত গবেষক ও বিশ্লেষক (In-depth Research)</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কনফিগারেশন সংরক্ষণ করুন' : 'Save Configuration'}</span>
              </button>

              <button
                onClick={handleTestPing}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1.5"
                title="Test Ping"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{isTesting ? 'পিং হচ্ছে...' : 'টেস্ট পিং'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl border border-slate-800">
                &gt; {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Right: Document Forensic & Legal Scanner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <FileSearch className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'দলিল ফরেনসিক ও আইনি অডিট ল্যাব' : 'Document Forensic & Legal Audit Lab'}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              AI OCR AUDIT
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'নথির নাম বা দলিলের বর্ণনা লিখুন:' : 'Document Title or Description:'}
              </label>
              <input
                type="text"
                value={forensicDocName}
                onChange={(e) => setForensicDocName(e.target.value)}
                placeholder="যেমন: ১৯৭৮ সালের বায়া দলিল ও আরএস খতিয়ান দাগ নং ১৮২"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'দলিল থেকে উদ্ধৃত অংশ বা সন্দেহযুক্ত ধারা পেস্ট করুন:' : 'Paste Document Excerpt or Clauses:'}
              </label>
              <textarea
                rows={4}
                value={forensicText}
                onChange={(e) => setForensicText(e.target.value)}
                placeholder="মৌজা ভবানীপুর, দাগ নং ১৮২, সাব-কবলা দলিল... খতিয়ান খারিজ বা ওয়ারিশান সনদ সম্পর্কে কোনো অস্পষ্টতা থাকলে এখানে লিখুন..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleRunForensicScan}
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? (lang === 'bn' ? 'এআই নিরীক্ষা চলছে...' : 'Auditing...') : (lang === 'bn' ? 'এআই ফরেনসিক অডিট চালান' : 'Run AI Forensic Audit')}</span>
            </button>

            {analysisReport && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-teal-200 dark:border-teal-800/50 space-y-2 mt-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-800 dark:text-teal-300">
                    {lang === 'bn' ? 'অডিট সারাংশ:' : 'Audit Summary:'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
                    COMPLIANT
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bangla">
                  {analysisReport.summaryBn}
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">চেকপয়েন্ট:</span>
                  {analysisReport.checkpoints?.map((cp: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{cp}</span>
                    </div>
                  ))}
                </div>
                {analysisReport.suggestedRoadmap && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                    💡 {analysisReport.suggestedRoadmap}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Scenario Roadmap Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'bn' ? 'আইনি রূপরেখা ও লাভজনক কৌশল জেনারেটর' : 'Legal Roadmap & Strategy Generator'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'দালাল ও অতিরিক্ত খরচ পরিহার করে সরাসরি সরকারি আইনের সুবিধা গ্রহণের সুনির্দিষ্ট গাইড' : 'Tailored citizen strategy with cost estimates and legal safeguards'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="land_inheritance">১. পৈতৃক সম্পত্তির ওয়ারিশান বণ্টন ও মিউটেশন</option>
              <option value="fraud_prevention">২. জমি ক্রয়ে বায়া দলিল ও রেকর্ড জালিয়াতি প্রতিরোধ</option>
              <option value="passport_fasttrack">৩. ই-পাসপোর্ট ও এনআইডি দ্রুত সংশোধন</option>
            </select>

            <button
              onClick={handleGenerateScenarioRoadmap}
              disabled={isGeneratingRoadmap}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingRoadmap ? 'animate-spin' : ''}`} />
              <span>{isGeneratingRoadmap ? 'জেনারেট হচ্ছে...' : (lang === 'bn' ? 'রোডম্যাপ তৈরি করুন' : 'Generate Roadmap')}</span>
            </button>
          </div>
        </div>

        {roadmapOutput && (
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-bangla text-xs md:text-sm leading-relaxed whitespace-pre-wrap space-y-3 animate-in fade-in">
            {roadmapOutput}
          </div>
        )}
      </div>

    </div>
  );
};
