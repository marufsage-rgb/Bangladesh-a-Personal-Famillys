/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  FileCheck2, 
  Copy, 
  Check, 
  Trash2, 
  HelpCircle,
  PhoneCall,
  Scale,
  Compass,
  ArrowRight
} from 'lucide-react';
import { AIChatMessage, AppLanguage, AIProviderConfig } from '../types';
import { AIAdvisorService, DEFAULT_AI_CONFIG } from '../services/aiAdvisorService';

interface AIAdvisorChatProps {
  lang: AppLanguage;
  aiConfig?: AIProviderConfig;
}

export const AIAdvisorChat: React.FC<AIAdvisorChatProps> = ({ 
  lang,
  aiConfig = DEFAULT_AI_CONFIG 
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome_01',
      sender: 'assistant',
      text: lang === 'bn' 
        ? `আসসালামু আলাইকুম! আমি **মারুফের পরিবার** এর বিশেষায়িত **বাংলাদেশ সরকার ও নাগরিক আইন উপদেষ্টা এআই** (Gemini 3.8 Flash)।

আমি আপনাকে নিম্নলিখিত বিষয়ে সরকারি নিয়ম ও আইনি রূপরেখা প্রদানে প্রস্তুত:
1. 📜 **ভূমি ও দলিল সংক্রান্ত**: নামজারি (ই-নামজারি mutation.land.gov.bd), সরকারি ফি **১,১৭০/- টাকা**, খতিয়ান ও দাগ যাচাই, খাজনা (ldtax.gov.bd)।
2. 🏛️ **মরহুম পিতার উত্তরাধিকার ও ফরায়েজ**: ওয়ারিশান সনদ গ্রহণ, বণ্টননামা দলিল সম্পাদন এবং ছেলে-মেয়ে-স্ত্রীর অংশের নির্ভুল হিসাব।
3. 🪪 **জাতীয় পরিচয়পত্র ও ই-পাসপোর্ট**: স্মার্ট এনআইডি ভুল সংশোধন, ই-পাসপোর্ট ফি ও পুলিশ ক্লিয়ারেন্স।
4. 📞 **জরুরি হেল্পলাইন**: ভূমি সেবা **১৬১২২**, জরুরি সেবা **৯৯৯**, তথ্য বাতায়ন **৩৩৩**, দুদক **১০৬**।

আপনার প্রশ্নটি নিচে বাংলায় বা ইংরেজিতে লিখুন অথবা মাইক্রোফোনে কথা বলুন।`
        : `Welcome! I am the specialized **Bangladesh Citizen & Legal Advisor AI** for Maruf's Family (powered by Gemini 3.8 Flash).

I can guide you through:
1. 📜 **Land & Registry**: E-Mutation at mutation.land.gov.bd (Official fee 1,170 BDT), Dag/Khatian verification, Land Tax.
2. 🏛️ **Inheritance & Faraiz**: Warishan Certificate, Partition deed, and legal share calculation for heirs of late parents.
3. 🪪 **NID & e-Passport**: Smart card correction, passport fees, and police verification.
4. 📞 **Official Helplines**: Land Helpline **16122**, Emergency **999**, Citizen Services **333**.

Type your question below or use the microphone to speak.`,
      timestamp: Date.now()
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert(lang === 'bn' ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সমর্থন করে না। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন।' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Mic start error', err);
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const responseText = await AIAdvisorService.sendChatMessage(
        query,
        messages,
        aiConfig,
        lang
      );

      const assistantMessage: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (e: any) {
      console.error(e);
      const errorMessage: AIChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `দুঃখিত, কোনো ত্রুটি হয়েছে। অনুগ্রহ করে সরকারি ভূমি সেবা হটলাইন ১৬১২২ এ যোগাযোগ করুন।`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (msg: AIChatMessage) => {
    if (currentlySpeakingId === msg.id) {
      AIAdvisorService.stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      setCurrentlySpeakingId(msg.id);
      AIAdvisorService.speak(msg.text, lang, () => {
        setCurrentlySpeakingId(null);
      });
    }
  };

  const handleCopy = (msg: AIChatMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const QUICK_QUESTIONS = [
    {
      labelBn: "মরহুম বাবার জমির নামজারি ও ওয়ারিশান খতিয়ান করার নিয়ম",
      labelEn: "How to process inheritance mutation for late father's land",
      prompt: "মরহুম পিতা আব্দুল বারিক ভূঁইয়ার নামের পৈতৃক জমির নামজারি ও ওয়ারিশান খতিয়ান করার সঠিক সরকারি নিয়ম, প্রয়োজনীয় দলিল ও ধাপগুলো কী কী?"
    },
    {
      labelBn: "ই-নামজারি সরকারি ফি ১,১৭০ টাকা এবং পরিশোধের ধাপ",
      labelEn: "Official E-Mutation Fee 1,170 BDT and payment steps",
      prompt: "অনলাইনে mutation.land.gov.bd তে ই-নামজারি করার সরকারি মোট ফি কত? ১,১৭০ টাকার বেশি কেউ দাবি করলে কী করণীয় এবং কীভাবে আবেদন করব?"
    },
    {
      labelBn: "মুসলিম ফরায়েজ আইনে পিতা মারা গেলে স্ত্রী ও সন্তানদের অংশ",
      labelEn: "Muslim inheritance share breakdown for wife, sons & daughters",
      prompt: "পিতার মৃত্যুর পর পৈতৃক স্থাবর সম্পত্তিতে স্ত্রী, ২ ছেলে ও ১ মেয়ের অংশ বণ্টন ফরায়েজ আইনানুযায়ী শতকরা বা ভগ্নাংশে হিসাব করে দিন।"
    },
    {
      labelBn: "ই-পাসপোর্ট ও এনআইডি নামের বানান সংশোধনের পদ্ধতি",
      labelEn: "e-Passport & NID Smart Card spelling correction steps",
      prompt: "জাতীয় পরিচয়পত্র ও সার্টিফিকেটে নামের বানান বা জন্মতারিখে অমিল থাকলে ই-পাসপোর্ট ও এনআইডি সংশোধনের সঠিক আইনি নিয়ম কী?"
    },
    {
      labelBn: "ভূমি সেবা হটলাইন ১৬১২২ এর মাধ্যমে সরাসরি ফোন আবেদন",
      labelEn: "Applying for Land Services directly via 16122 call center",
      prompt: "ভূমি মন্ত্রণালয়ের ১৬১২২ হটলাইনে ফোন করে কীভাবে সরাসরি নামজারি আবেদন করা যায় এবং অভিযোগ দাখিল করা যায়?"
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[550px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Advisor Header Bar */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-emerald-800/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base md:text-lg tracking-tight">
                {lang === 'bn' ? 'বাংলাদেশ সরকারি সেবা ও আইনি উপদেষ্টা এআই' : 'Bangladesh Citizen & Legal Advisor AI'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-emerald-200/80 text-xs">
              {lang === 'bn' ? 'ভূমি আইন • নামজারি (১,১৭০/-) • ফরায়েজ বণ্টন • এনআইডি ও পাসপোর্ট • হটলাইন ১৬১২২' : 'Land Laws • E-Mutation • Muslim Faraiz • NID & Passport • Hotline 16122'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 text-xs flex items-center space-x-1 transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* Quick Suggestion Pills */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center space-x-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'bn' ? 'জরুরি পরামর্শ:' : 'Quick Prompts:'}</span>
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q.prompt)}
            className="px-3 py-1 rounded-full text-xs shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all font-medium"
          >
            {lang === 'bn' ? q.labelBn : q.labelEn}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-teal-700 text-white shadow-sm'
              }`}>
                {isUser ? 'ME' : <Bot className="w-5 h-5 text-emerald-300" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                isUser 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-sm'
              }`}>
                {/* Content formatting */}
                <div className="whitespace-pre-wrap font-bangla space-y-2">
                  {msg.text}
                </div>

                {/* Footer Controls for Assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Scale className="w-3 h-3 text-emerald-500" />
                      <span>{lang === 'bn' ? 'বাংলাদেশ সরকারি বিধিমালা যাচাইকৃত' : 'Grounded in Bangladesh Law'}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSpeak(msg)}
                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                          currentlySpeakingId === msg.id ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : ''
                        }`}
                        title={currentlySpeakingId === msg.id ? 'Stop Voice' : 'Read Aloud'}
                      >
                        {currentlySpeakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopy(msg)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>{lang === 'bn' ? 'বাংলাদেশ আইন ও গেজেট পর্যালোচনা করা হচ্ছে...' : 'Analyzing laws and gazettes...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Voice & Keyboard */}
      <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        {isRecording && (
          <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>{lang === 'bn' ? 'ভয়েস রেকর্ডিং সক্রিয়: আপনার আইনি প্রশ্নটি স্পষ্টভাবে বলুন...' : 'Listening: Speak your question clearly...'}</span>
            </div>
            <button 
              onClick={toggleVoiceRecording}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              {lang === 'bn' ? 'থামুন' : 'Stop'}
            </button>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice Input Mic */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2.5 md:p-3 rounded-xl border transition-all ${
              isRecording 
                ? 'bg-rose-500 border-rose-600 text-white ring-4 ring-rose-500/20' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500'
            }`}
            title={lang === 'bn' ? 'ভয়েসে প্রশ্ন করতে ক্লিক করুন (বাংলা বা ইংরেজি)' : 'Voice input in Bangla or English'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'পারিবারিক জমি, বাবার দলিল, নামজারি বা সরকারি আইন সংক্রান্ত প্রশ্ন লিখুন...'
                : 'Ask anything about land mutation, father\'s deed, inheritance...'
            }
            className="flex-1 px-4 py-2.5 md:py-3 text-xs md:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 md:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs md:text-sm flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
          </button>
        </form>

        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{lang === 'bn' ? 'ভূমি সেবা কলসেন্টার: ১৬১২২ • জাতীয় জরুরি সেবা: ৯৯৯' : 'Land Hotline: 16122 • Emergency: 999'}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{lang === 'bn' ? 'সার্ভার সাইড জেমিনি ৩.৮ ফ্ল্যাশ সুরক্ষিত' : 'Grounded on Official Bangladesh Portals'}</span>
        </div>
      </div>

    </div>
  );
};
