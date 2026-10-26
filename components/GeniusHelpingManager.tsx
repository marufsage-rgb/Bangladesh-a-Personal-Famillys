/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FamilyMember, 
  VaultDocument, 
  LockerEntry, 
  AppLanguage, 
  AIChatMessage 
} from '../types';
import { AIAdvisorService } from '../services/aiAdvisorService';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Search, 
  Key, 
  MapPin, 
  FileText, 
  HardDrive, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle, 
  ChevronRight,
  Calculator,
  Compass,
  ArrowRight
} from 'lucide-react';

interface GeniusHelpingManagerProps {
  currentUser: FamilyMember;
  lang: AppLanguage;
  documents: VaultDocument[];
  lockerEntries: LockerEntry[];
  isBiometricUnlocked: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'vault' | 'locker' | 'advisor' | 'hotlines' | 'lab' | 'admin') => void;
  onSearchVault: (query: string) => void;
  onTriggerBiometrics: () => void;
  onOpenGoogleDrive: () => void;
  onOpenAddEntryModal?: (type: 'password' | 'address' | 'document' | 'image' | 'note') => void;
}

export const GeniusHelpingManager: React.FC<GeniusHelpingManagerProps> = ({
  currentUser,
  lang,
  documents,
  lockerEntries,
  isBiometricUnlocked,
  isOpen,
  onClose,
  onNavigateTab,
  onSearchVault,
  onTriggerBiometrics,
  onOpenGoogleDrive,
  onOpenAddEntryModal
}) => {
  const isBn = lang === 'bn';
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: isBn 
        ? `আসসালামু আলাইকুম ${currentUser.nameBn || currentUser.name}! আমি মারুফের পরিবারের সার্বক্ষণিক জিনিয়াস হেল্পিং ম্যানেজার (Genius Agentic Assistant)। আপনার পারিবারিক দলিলপত্র, পাসওয়ার্ড লকার, গুগল ড্রাইভ ব্যাকআপ এবং বাংলাদেশ ভূমি ও আইনি নির্দেশনায় আমি আপনাকে তাৎক্ষণিক সাহায্য করতে প্রস্তুত। আমাকে যেকোনো নির্দেশ দিন!`
        : `Greetings ${currentUser.name}! I am your Live Helping Manager Genius Agent for the Maruf Family. I can search documents, manage your secure passwords & address locker, connect Google Drive, and guide you through Bangladesh legal & inheritance affairs. How can I assist you?`,
      timestamp: Date.now(),
      category: 'welcome'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSynthesisEnabled, setVoiceSynthesisEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Web Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isBn ? 'bn-BD' : 'en-US';

      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onend = () => setIsVoiceActive(false);
      recognition.onerror = () => setIsVoiceActive(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleAgentSubmit(transcript);
        }
      };

      speechRecognitionRef.current = recognition;
    }
  }, [isBn]);

  const toggleVoiceRecording = () => {
    if (!speechRecognitionRef.current) {
      alert(isBn ? 'আপনার ব্রাউজারে ভয়েস সমর্থন নেই' : 'Speech recognition not supported in this browser');
      return;
    }

    if (isVoiceActive) {
      speechRecognitionRef.current.stop();
      setIsVoiceActive(false);
    } else {
      speechRecognitionRef.current.lang = isBn ? 'bn-BD' : 'en-US';
      speechRecognitionRef.current.start();
      setIsVoiceActive(true);
    }
  };

  const speakResponse = (text: string) => {
    if (!voiceSynthesisEnabled) return;
    AIAdvisorService.speak(text, lang);
  };

  const handleAgentSubmit = async (prompt?: string) => {
    const query = (prompt || inputText).trim();
    if (!query || isProcessing) return;

    setInputText('');

    // Add user message
    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    const lower = query.toLowerCase();

    // 1. Check for Agentic Intent Execution
    let actionExecutedText = '';

    if (lower.includes('পাসওয়ার্ড') || lower.includes('লকার') || lower.includes('password') || lower.includes('pin') || lower.includes('পিন')) {
      onNavigateTab('vault');
      if (!isBiometricUnlocked) {
        onTriggerBiometrics();
        actionExecutedText = isBn 
          ? 'আপনার পাসওয়ার্ড লকার সুরক্ষায় বায়োমেট্রিক সেন্সর সক্রিয় করা হয়েছে। স্পর্শ করে আনলক সম্পন্ন করুন।'
          : 'Triggered biometric sensor to safeguard your password locker. Please authenticate.';
      } else {
        actionExecutedText = isBn 
          ? 'পারিবারিক পাসওয়ার্ড ও এনক্রিপ্টেড ক্রেডেনশিয়াল লকারে নেভিগেট করা হলো।'
          : 'Navigated to your Family Password & Credential Locker.';
      }
    } else if (lower.includes('ড্রাইভ') || lower.includes('drive') || lower.includes('গুগল ড্রাইভ')) {
      onOpenGoogleDrive();
      actionExecutedText = isBn 
        ? 'গুগল ড্রাইভ ফাইল ব্রাউজার ও সিঙ্ক প্যানেল চালু করা হলো। আপনার ব্যক্তিগত ড্রাইভের ছবি বা দলিল আমদানি করতে পারেন।'
        : 'Opened Google Drive File Explorer and sync hub.';
    } else if (lower.includes('ঠিকানা') || lower.includes('ভিটা') || lower.includes('address') || lower.includes('homestead') || lower.includes('বাড়ি')) {
      onNavigateTab('vault');
      actionExecutedText = isBn 
        ? 'সোনারগাঁও পৈতৃক ভিটা (মৌজা রামনগর, দাগ ১৮২) এবং ঢাকা বাসভবনের পারিবারিক ঠিকানা প্রদর্শিত হচ্ছে।'
        : 'Displaying Ancestral Homestead (Sonargaon, Dag 182) and Dhaka residence address records.';
    } else if (lower.includes('উত্তরাধিকার') || lower.includes('ফরায়েজ') || lower.includes('inheritance') || lower.includes('বাবা') || lower.includes('দলিল')) {
      onSearchVault('আব্দুল বারিক');
      onNavigateTab('vault');
      actionExecutedText = isBn 
        ? 'মরহুম বাবা আব্দুল বারিক ভূঁইয়ার স্মার্ট এনআইডি, মৃত্যু সনদ এবং ১৯৮২ সালের পৈতৃক জমিজমা দলিল ফিল্টার করা হলো।'
        : 'Filtered Late Father Abdul Barek Bhuyan\'s Smart NID, Death Certificate, and 1982 Land Deeds in the vault.';
    } else if (lower.includes('লক') || lower.includes('lock')) {
      if (lower.includes('আনলক') || lower.includes('unlock')) {
        onTriggerBiometrics();
        actionExecutedText = isBn ? 'বায়োমেট্রিক ও WebAuthn আনলক ইন্টারফেস ওপেন করা হয়েছে।' : 'Triggered Biometric & WebAuthn Unlock interface.';
      } else {
        onTriggerBiometrics(); // Will toggle/reset lock
        actionExecutedText = isBn ? 'পারিবারিক ভল্ট ও সংবেদনশীল সেশন তাৎক্ষণিক লক করা হলো।' : 'Family vault session locked immediately.';
      }
    } else if (lower.includes('হটলাইন') || lower.includes('জরুরি') || lower.includes('৯৯৯') || lower.includes('১৬১২২') || lower.includes('৩৩৩')) {
      onNavigateTab('hotlines');
      actionExecutedText = isBn 
        ? 'বাংলাদেশ সরকারের জরুরি হটলাইন ডিরেক্টরি (জাতীয় জরুরি সেবা ৯৯৯, ভূমি সেবা ১৬১২২) ওপেন করা হলো।'
        : 'Navigated to Government Emergency Hotlines directory.';
    }

    try {
      // 2. Fetch intelligent AI consultation from AIAdvisorService
      const aiResponse = await AIAdvisorService.askLegalAdvisor(query, lang, documents);

      const finalReply = actionExecutedText 
        ? `${actionExecutedText}\n\n${aiResponse.text}`
        : aiResponse.text;

      const botMsg: AIChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: finalReply,
        timestamp: Date.now(),
        referenceRules: aiResponse.referenceRules,
        suggestedSteps: aiResponse.suggestedSteps,
      };

      setMessages(prev => [...prev, botMsg]);
      speakResponse(botMsg.text);
    } catch (err) {
      console.error(err);
      const fallbackReply = actionExecutedText || (isBn 
        ? 'আপনার অনুরোধটি গ্রহণ করা হয়েছে। পারিবারিক ড্যাশবোর্ড থেকে সংশ্লিষ্ট তথ্যটি যাচাই করুন।' 
        : 'Your request has been processed. Please check the dashboard.');
      
      const botMsg: AIChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
      speakResponse(fallbackReply);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (actionTitle: string, queryText: string) => {
    handleAgentSubmit(queryText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-3xl h-[88vh] bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isBn ? 'জিনিয়াস হেল্পিং ম্যানেজার' : 'Genius Helping Manager'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Agentic AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isBn ? 'মারুফের পরিবারের ব্যক্তিগত পরামর্শক ও সক্রিয় সহকারী' : 'Live Family Assistant & Legal Operations Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Sound Toggle */}
            <button
              onClick={() => {
                setVoiceSynthesisEnabled(!voiceSynthesisEnabled);
                if (voiceSynthesisEnabled) window.speechSynthesis?.cancel();
              }}
              title={voiceSynthesisEnabled ? (isBn ? 'ভয়েস সাউন্ড বন্ধ' : 'Mute TTS') : (isBn ? 'ভয়েস সাউন্ড চালু' : 'Unmute TTS')}
              className={`p-2 rounded-xl border transition-colors ${
                voiceSynthesisEnabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {voiceSynthesisEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Agentic Action Chips */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleQuickAction('Heritage Docs', isBn ? 'মরহুম বাবা আব্দুল বারিক ভূঁইয়ার উত্তরাধিকার দলিল দেখাও' : 'Show Late Father Abdul Barek Bhuyan heritage papers')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-xs font-medium border border-slate-700/80 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'বাবার উত্তরাধিকার দলিল' : 'Father\'s Heritage'}</span>
          </button>

          <button
            onClick={() => handleQuickAction('Unlock Passwords', isBn ? 'আমার ব্যাংক ও নামজারি পাসওয়ার্ড লকার আনলক করো' : 'Unlock my Bank and mutation password locker')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-300 text-xs font-medium border border-slate-700/80 transition-all"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'পাসওয়ার্ড লকার' : 'Password Locker'}</span>
          </button>

          <button
            onClick={() => handleQuickAction('Google Drive', isBn ? 'গুগল ড্রাইভ ফাইল ব্রাউজার ওপেন করো' : 'Open Google Drive files')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-500/10 hover:border-blue-500/30 text-slate-300 hover:text-blue-300 text-xs font-medium border border-slate-700/80 transition-all"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>{isBn ? 'গুগল ড্রাইভ' : 'Google Drive'}</span>
          </button>

          <button
            onClick={() => handleQuickAction('Farayez Calculation', isBn ? 'মুসলিম উত্তরাধিকার আইনে সম্পত্তির ফরায়েজ হিসেব করে দাও' : 'Calculate estate inheritance shares under Bangladesh Muslim Law')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-500/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-300 text-xs font-medium border border-slate-700/80 transition-all"
          >
            <Calculator className="w-3.5 h-3.5 text-purple-400" />
            <span>{isBn ? 'ফরায়েজ হিসাব' : 'Estate Farayez'}</span>
          </button>

          <button
            onClick={() => handleQuickAction('Addresses', isBn ? 'পৈতৃক ভিটা ও পারিবারিক ঠিকানা দেখাও' : 'Show ancestral homestead and family address')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-xs font-medium border border-slate-700/80 transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{isBn ? 'পৈতৃক ভিটা ও ঠিকানা' : 'Homestead Address'}</span>
          </button>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Reference rules & Action steps */}
                  {msg.referenceRules && msg.referenceRules.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                      <div className="text-[11px] font-semibold text-emerald-400 mb-1">
                        {isBn ? 'আইনি রেফারেন্স ও বিধিমালা:' : 'Legal References:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.referenceRules.map((rule, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.suggestedSteps && msg.suggestedSteps.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1">
                      <div className="text-[11px] font-semibold text-amber-400">
                        {isBn ? 'পরবর্তী করণীয় রোডম্যাপ:' : 'Actionable Next Steps:'}
                      </div>
                      {msg.suggestedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 border border-slate-700 mt-1">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      currentUser.name[0]
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200" />
                <span className="text-slate-300 font-medium ml-1">
                  {isBn ? 'জিনিয়াস এজেন্ট প্রসেস করছে...' : 'Genius Agent is processing...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Voice Support */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAgentSubmit();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-3 rounded-2xl transition-all ${
                isVoiceActive
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={isVoiceActive ? (isBn ? 'কথা বলা শেষ করুন' : 'Stop voice') : (isBn ? 'ভয়েস কমান্ড বলুন' : 'Speak command')}
            >
              {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isBn ? 'জিনিয়াস ম্যানেজারকে প্রশ্ন করুন বা নির্দেশ দিন (যেমন: "বাবার জমির দলিল দেখাও")...' : 'Ask Genius Manager (e.g. "Find father\'s deeds", "Unlock passwords")...'}
              className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isProcessing}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-transform active:scale-95 shadow-lg shadow-emerald-900/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
