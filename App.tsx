/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FamilyMember, 
  VaultDocument, 
  AccessRequest, 
  AppTheme, 
  AppLanguage, 
  AIProviderConfig,
  LockerEntry
} from './types';
import { FamilyVaultService, INITIAL_ADMIN } from './services/familyVaultService';
import { AIAdvisorService, DEFAULT_AI_CONFIG } from './services/aiAdvisorService';
import { initGoogleAuth, getDriveAccessToken, getDriveUser } from './services/googleDriveAuthService';
import { Navbar } from './components/Navbar';
import { VaultView } from './components/VaultView';
import { FamilyLockerView } from './components/FamilyLockerView';
import { ShowcaseHero } from './components/ShowcaseHero';
import { GoogleDriveExplorer } from './components/GoogleDriveExplorer';
import { GeniusHelpingManager } from './components/GeniusHelpingManager';
import { WorldNewsTicker } from './components/WorldNewsTicker';
import { AIAdvisorChat } from './components/AIAdvisorChat';
import { HotlinesView } from './components/HotlinesView';
import { AILabView } from './components/AILabView';
import { AdminBackupPanel } from './components/AdminBackupPanel';
import { BiometricUnlockModal } from './components/BiometricUnlockModal';
import { BiometricService } from './services/biometricService';
import { EditProfileModal } from './components/EditProfileModal';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Check, 
  UserCheck, 
  LogOut, 
  Key, 
  Sparkles,
  PhoneCall,
  HardDrive,
  Mic,
  MicOff,
  Volume2,
  Search,
  Navigation,
  Radio,
  Bot,
  LayoutGrid,
  FileText
} from 'lucide-react';

const App: React.FC = () => {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<'vault' | 'advisor' | 'hotlines' | 'lab' | 'admin'>('vault');
  const [lang, setLang] = useState<AppLanguage>('bn');
  const [theme, setTheme] = useState<AppTheme>('emerald');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Core Data States
  const [currentUser, setCurrentUser] = useState<FamilyMember>(() => FamilyVaultService.getCurrentUser());
  const [members, setMembers] = useState<FamilyMember[]>(() => FamilyVaultService.getMembers());
  const [documents, setDocuments] = useState<VaultDocument[]>(() => FamilyVaultService.getDocuments());
  const [lockerEntries, setLockerEntries] = useState<LockerEntry[]>(() => FamilyVaultService.getLockerEntries());
  const [requests, setRequests] = useState<AccessRequest[]>(() => FamilyVaultService.getRequests());
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(DEFAULT_AI_CONFIG);

  // Google Drive & Genius Manager States
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);
  const [driveUser, setDriveUser] = useState<any>(null);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState<boolean>(false);
  const [showGeniusManagerModal, setShowGeniusManagerModal] = useState<boolean>(false);
  const [vaultDisplayMode, setVaultDisplayMode] = useState<'locker' | 'detailed'>('locker');

  // Modal State for Member Switcher & Profile Editing
  const [showUserSwitcherModal, setShowUserSwitcherModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  // Biometric Unlock States
  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState<boolean>(() => BiometricService.isVaultUnlocked(currentUser.id));
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [biometricTargetDocTitle, setBiometricTargetDocTitle] = useState<string | undefined>(undefined);

  // Initialize Google Drive Auth Listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setIsDriveConnected(true);
        setDriveUser(user);
      },
      () => {
        setIsDriveConnected(false);
        setDriveUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Web Speech API Voice Command & Search State
  const [vaultSearchQuery, setVaultSearchQuery] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const voiceRecognitionRef = useRef<any>(null);

  // Initialize Web Speech API for global voice navigation and searches
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceTranscript('');
        setVoiceFeedback(lang === 'bn' ? 'শুনছি... আপনার নেভিগেশন বা সার্চের বিষয় বলুন' : 'Listening... Speak navigation or search query');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);

        if (event.results[0].isFinal) {
          executeGlobalVoiceCommand(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice command recognition error:', e);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      voiceRecognitionRef.current = recognition;
    }
  }, [lang, isBiometricUnlocked]);

  const toggleGlobalVoice = () => {
    if (!voiceRecognitionRef.current) {
      alert(lang === 'bn' 
        ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সমর্থন করে না। ক্রোম ব্রাউজার ব্যবহার করুন।' 
        : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isVoiceListening) {
      try { voiceRecognitionRef.current.stop(); } catch {}
      setIsVoiceListening(false);
    } else {
      try {
        voiceRecognitionRef.current.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
        voiceRecognitionRef.current.start();
        setIsVoiceListening(true);
      } catch (err) {
        console.warn('Voice start error', err);
        setIsVoiceListening(false);
      }
    }
  };

  const executeGlobalVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    let handled = false;

    // 1. Navigation Commands
    if (
      text.includes('ভল্ট') || 
      text.includes('দলিল') || 
      text.includes('নথি') || 
      text.includes('আর্কাইভ') || 
      text.includes('vault') || 
      text.includes('document')
    ) {
      setCurrentTab('vault');
      const msg = lang === 'bn' ? 'পারিবারিক ভল্ট খোলা হলো।' : 'Navigating to Family Vault.';
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    } else if (
      text.includes('উপদেষ্টা') || 
      text.includes('আইন') || 
      text.includes('পরামর্শ') || 
      text.includes('চ্যাট') || 
      text.includes('এআই') || 
      text.includes('advisor') || 
      text.includes('legal') || 
      text.includes('chat')
    ) {
      setCurrentTab('advisor');
      const msg = lang === 'bn' ? 'বাংলাদেশ আইনি উপদেষ্টা এআই খোলা হলো।' : 'Opening Citizen AI Legal Advisor.';
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    } else if (
      text.includes('হটলাইন') || 
      text.includes('৯৯৯') || 
      text.includes('১৬১২২') || 
      text.includes('৩৩৩') || 
      text.includes('জরুরি') || 
      text.includes('hotline') || 
      text.includes('emergency') || 
      text.includes('call')
    ) {
      setCurrentTab('hotlines');
      const msg = lang === 'bn' ? 'সরকারি জরুরি হটলাইন ডিরেক্টরি ওপেন হলো।' : 'Opening Government Emergency Hotlines.';
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    } else if (
      text.includes('ল্যাব') || 
      text.includes('গবেষণা') || 
      text.includes('এপিআই') || 
      text.includes('lab') || 
      text.includes('scanner') || 
      text.includes('api')
    ) {
      setCurrentTab('lab');
      const msg = lang === 'bn' ? 'এআই ফরেনসিক ল্যাব ওপেন করা হলো।' : 'Opening AI Research Lab.';
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    } else if (
      text.includes('এডমিন') || 
      text.includes('ব্যাকআপ') || 
      text.includes('মারুফ') || 
      text.includes('প্যানেল') || 
      text.includes('admin') || 
      text.includes('backup')
    ) {
      setCurrentTab('admin');
      const msg = lang === 'bn' ? 'এডমিন ও ক্লাউড ব্যাকআপ প্যানেল খোলা হলো।' : 'Opening Admin Panel.';
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    }

    // 2. Document Search Voice Commands
    const searchPrefixes = ['খুঁজুন', 'খুঁজো', 'সার্চ', 'দেখাও', 'বের করো', 'search', 'find', 'show'];
    let extractedQuery = '';

    for (const prefix of searchPrefixes) {
      if (text.includes(prefix)) {
        const parts = text.split(prefix);
        if (parts[1] && parts[1].trim()) {
          extractedQuery = parts[1].trim();
          break;
        }
      }
    }

    const keywords = [
      'বাবা', 'আব্দুল বারিক', 'nid', 'এনআইডি', 'পাসপোর্ট', 'passport', 
      'খতিয়ান', 'khatian', 'নামজারি', 'mutation', 'দলিল', 'deed', 
      'খাজনা', 'tax', 'ওয়ারিশান', 'warishan', 'ব্যাংক', 'bank', 'দাগ', 'ভবানীপুর'
    ];

    if (!extractedQuery) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          extractedQuery = rawText.trim();
          break;
        }
      }
    }

    if (extractedQuery) {
      setCurrentTab('vault');
      setVaultSearchQuery(extractedQuery);
      const msg = lang === 'bn' 
        ? `"${extractedQuery}" সংক্রান্ত পারিবারিক নথি খোঁজা হচ্ছে।` 
        : `Searching family vault for "${extractedQuery}".`;
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    }

    // 3. Biometric Commands
    if (text.includes('লক') || text.includes('lock')) {
      BiometricService.setVaultUnlocked(currentUser.id, false);
      setIsBiometricUnlocked(false);
      const msg = lang === 'bn' ? 'ভল্ট বায়োমেট্রিক দিয়ে লক করা হলো।' : 'Vault locked with biometrics.';
      setVoiceFeedback(msg);
      AIAdvisorService.speak(msg, lang);
      handled = true;
    } else if (text.includes('আনলক') || text.includes('বায়োমেট্রিক') || text.includes('unlock')) {
      setShowBiometricModal(true);
      const msg = lang === 'bn' ? 'বায়োমেট্রিক আনলক স্ক্রিন প্রদর্শিত হচ্ছে।' : 'Displaying biometric unlock.';
      setVoiceFeedback(msg);
      handled = true;
    }

    if (!handled) {
      const msg = lang === 'bn' 
        ? `শুনলাম: "${rawText}"। আপনি 'ভল্ট', 'আইনি উপদেষ্টা', 'হটলাইন', বা 'খুঁজুন বাবার দলিল' বলতে পারেন।` 
        : `Understood: "${rawText}". You can say "vault", "hotlines", or "search passport".`;
      setVoiceFeedback(msg);
    }
  };

  const handleClearAllDemo = () => {
    const blank = FamilyVaultService.clearAllDemoData();
    setDocuments(blank);
  };

  const handleResetToDemo = () => {
    const demo = FamilyVaultService.resetToInitialDemo();
    setDocuments(demo);
  };

  // Sync Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync Theme Classes
  useEffect(() => {
    document.body.className = `theme-${theme} ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-white transition-colors duration-200`;
  }, [theme, isDarkMode]);

  // Document Handlers
  const handleAddDocument = (newDoc: VaultDocument) => {
    const updated = FamilyVaultService.addDocument(newDoc);
    setDocuments(updated);
  };

  const handleTogglePin = (docId: string) => {
    const updated = FamilyVaultService.togglePin(docId);
    setDocuments(updated);
  };

  const handleToggleHide = (docId: string) => {
    const updated = FamilyVaultService.toggleHide(docId);
    setDocuments(updated);
  };

  const handleDeleteDocument = (docId: string) => {
    const updated = FamilyVaultService.deleteDocument(docId);
    setDocuments(updated);
  };

  // Locker Entry Handlers (Passwords, Addresses, Photos, Notes)
  const handleAddLockerEntry = (entry: Omit<LockerEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = FamilyVaultService.addLockerEntry(entry);
    setLockerEntries(updated);
  };

  const handleUpdateLockerEntry = (id: string, updates: Partial<LockerEntry>) => {
    const updated = FamilyVaultService.updateLockerEntry(id, updates);
    setLockerEntries(updated);
  };

  const handleDeleteLockerEntry = (id: string) => {
    const updated = FamilyVaultService.deleteLockerEntry(id);
    setLockerEntries(updated);
  };

  const handleToggleHideEntry = (id: string) => {
    const updated = FamilyVaultService.toggleHideLockerEntry(id);
    setLockerEntries(updated);
  };

  const handleTogglePinEntry = (id: string) => {
    const updated = FamilyVaultService.togglePinLockerEntry(id);
    setLockerEntries(updated);
  };

  // Import directly from Google Drive Explorer into Vault or Photo Locker
  const handleImportDriveToVault = (doc: Partial<VaultDocument>) => {
    const newDoc: VaultDocument = {
      id: `doc_drive_${Date.now()}`,
      title: doc.title || 'Drive Document',
      titleBn: doc.titleBn || 'গুগল ড্রাইভ নথি',
      ownerEmail: currentUser.email,
      ownerName: currentUser.name,
      category: doc.category || 'personal_id',
      docType: doc.docType || 'Drive File',
      fileName: doc.fileName || 'drive_file',
      fileSize: doc.fileSize || 'Unknown',
      fileType: doc.fileType || 'image',
      fileData: doc.fileData,
      googleDriveUrl: doc.googleDriveUrl,
      driveFileId: doc.driveFileId,
      isPinned: false,
      isHidden: false,
      securityLevel: 'public_family',
      tags: ['Google Drive', 'মারুফের পরিবার'],
      createdAt: Date.now(),
    };
    handleAddDocument(newDoc);
  };

  const handleImportDriveToLocker = (entry: Partial<LockerEntry>) => {
    handleAddLockerEntry({
      type: entry.type || 'image',
      title: entry.title || 'Drive Photo',
      titleBn: entry.titleBn || 'ড্রাইভ আলোকচিত্র',
      ownerEmail: currentUser.email,
      ownerName: currentUser.name,
      securityLevel: 'public_family',
      isPinned: false,
      isHidden: false,
      imageUrl: entry.imageUrl,
      driveFileId: entry.driveFileId,
      caption: entry.caption,
      tags: ['Google Drive', 'ছবি'],
    });
  };

  // Access Request Handlers
  const handleRequestAccess = (docId: string, docTitle: string, reason: string) => {
    const updatedRequests = FamilyVaultService.requestAccess(docId, docTitle, currentUser, reason);
    setRequests(updatedRequests);
    alert(lang === 'bn' 
      ? 'আপনার অ্যাক্সেস আবেদন প্রশাসক মারুফের নিকট প্রেরণ করা হয়েছে।' 
      : 'Access request has been forwarded to Administrator Maruf.');
  };

  const handleApproveRequest = (reqId: string) => {
    const result = FamilyVaultService.approveRequest(reqId);
    setRequests(result.requests);
    setMembers(result.members);
  };

  const handleRejectRequest = (reqId: string) => {
    const updated = FamilyVaultService.rejectRequest(reqId);
    setRequests(updated);
  };

  // Member Handlers
  const handleApproveMember = (memberId: string) => {
    const updated = FamilyVaultService.approveMember(memberId);
    setMembers(updated);
  };

  const handleRemoveMember = (memberId: string) => {
    const updated = FamilyVaultService.removeMember(memberId);
    setMembers(updated);
  };

  const handleAddMember = (member: FamilyMember) => {
    const updated = [...members, member];
    FamilyVaultService.saveMembers(updated);
    setMembers(updated);
  };

  const handleSaveMemberProfile = (updated: FamilyMember) => {
    const updatedList = members.map(m => m.id === updated.id ? updated : m);
    if (!updatedList.some(m => m.id === updated.id)) {
      updatedList.push(updated);
    }
    FamilyVaultService.saveMembers(updatedList);
    setMembers(updatedList);

    if (updated.id === currentUser.id) {
      FamilyVaultService.setCurrentUser(updated);
      setCurrentUser(updated);
    }
  };

  // Biometric Handlers
  const handleToggleBiometricLock = () => {
    if (isBiometricUnlocked) {
      BiometricService.setVaultUnlocked(currentUser.id, false);
      setIsBiometricUnlocked(false);
    } else {
      setBiometricTargetDocTitle(undefined);
      setShowBiometricModal(true);
    }
  };

  const handleTriggerBiometricUnlock = (targetDocTitle?: string) => {
    setBiometricTargetDocTitle(targetDocTitle);
    setShowBiometricModal(true);
  };

  const handleBiometricSuccess = () => {
    BiometricService.setVaultUnlocked(currentUser.id, true);
    setIsBiometricUnlocked(true);
  };

  // User Switcher & Login
  const handleSwitchUser = (member: FamilyMember) => {
    setCurrentUser(member);
    FamilyVaultService.setCurrentUser(member);
    setIsBiometricUnlocked(BiometricService.isVaultUnlocked(member.id));
    setShowUserSwitcherModal(false);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const found = members.find(m => m.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) {
      if (found.pin && found.pin !== loginPin) {
        setLoginError(lang === 'bn' ? 'ভুল নিরাপত্তা পিন!' : 'Incorrect PIN!');
        return;
      }
      handleSwitchUser(found);
      setLoginEmail('');
      setLoginPin('');
    } else {
      // Create new pending member
      const newApplicant: FamilyMember = {
        id: `member_${Date.now()}`,
        name: loginEmail.split('@')[0],
        nameBn: loginEmail.split('@')[0],
        email: loginEmail,
        relationship: 'পারিবারিক সদস্য (Family Member)',
        role: 'pending',
        pin: loginPin || '1234',
        status: 'pending',
        joinedAt: Date.now(),
        requestedAccessDocs: []
      };
      const updated = [...members, newApplicant];
      FamilyVaultService.saveMembers(updated);
      setMembers(updated);
      handleSwitchUser(newApplicant);
      setLoginEmail('');
      setLoginPin('');
    }
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUser={() => setShowUserSwitcherModal(true)}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        pendingRequestsCount={pendingRequestsCount}
        isBiometricUnlocked={isBiometricUnlocked}
        onToggleBiometricLock={handleToggleBiometricLock}
        onEditProfile={() => {
          setEditingMember(currentUser);
          setShowEditProfileModal(true);
        }}
        isDriveConnected={isDriveConnected}
        onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
        onOpenGeniusManager={() => setShowGeniusManagerModal(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Active Member Personalized Showcase Hero & Quick Launcher */}
        <div className="mb-6">
          <ShowcaseHero
            currentUser={currentUser}
            lang={lang}
            isBiometricUnlocked={isBiometricUnlocked}
            isDriveConnected={isDriveConnected}
            driveUserEmail={driveUser?.email}
            docCount={documents.length}
            passwordCount={lockerEntries.filter(e => e.type === 'password').length}
            addressCount={lockerEntries.filter(e => e.type === 'address').length}
            onOpenBiometrics={() => handleTriggerBiometricUnlock()}
            onOpenProfileEdit={() => {
              setEditingMember(currentUser);
              setShowEditProfileModal(true);
            }}
            onOpenGeniusManager={() => setShowGeniusManagerModal(true)}
            onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
          />
        </div>

        {/* World News Highlights - Always Highlighting Amazing Subjects */}
        <div className="mb-6">
          <WorldNewsTicker lang={lang} />
        </div>

        {/* Web Speech API Voice Command & Search Controller Bar */}
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={toggleGlobalVoice}
                className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
                  isVoiceListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 ring-4 ring-rose-500/20 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
                }`}
                title={lang === 'bn' ? 'ভয়েস নেভিগেশন ও দলিল সার্চ শুরু করতে ক্লিক করুন' : 'Click for Voice Navigation & Search'}
              >
                {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="overflow-hidden">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{lang === 'bn' ? 'ভয়েস নেভিগেশন ও দলিল সার্চ (Web Speech API)' : 'Voice Navigation & Vault Search'}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                      BN & EN
                    </span>
                  </span>
                  {isVoiceListening && (
                    <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold animate-pulse">
                      <Radio className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'কথা শুনছি...' : 'LISTENING...'}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-bangla">
                  {voiceTranscript ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      "{voiceTranscript}"
                    </span>
                  ) : voiceFeedback ? (
                    <span className="text-slate-700 dark:text-slate-300">
                      {voiceFeedback}
                    </span>
                  ) : (
                    <span>
                      {lang === 'bn' 
                        ? 'কথা বলুন: "ভল্ট", "লকার", "আইনি উপদেষ্টা", "হটলাইন", "খুঁজুন বাবার এনআইডি", "পাসপোর্ট", "লক করো"' 
                        : 'Say: "vault", "locker", "legal advisor", "hotlines", "search passport", "lock"'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Voice Command Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0 font-medium">
              <button
                onClick={() => {
                  setCurrentTab('vault');
                  setVaultDisplayMode('locker');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                লকার হাব
              </button>
              <button
                onClick={() => executeGlobalVoiceCommand('ভল্ট')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                ভল্ট
              </button>
              <button
                onClick={() => executeGlobalVoiceCommand('উপদেষ্টা')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                আইনি উপদেষ্টা
              </button>
              <button
                onClick={() => executeGlobalVoiceCommand('হটলাইন')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                হটলাইন
              </button>
              <button
                onClick={() => executeGlobalVoiceCommand('খুঁজুন বাবার এনআইডি')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60"
              >
                🔍 বাবার এনআইডি
              </button>
              <button
                onClick={() => executeGlobalVoiceCommand('খুঁজুন জমির দলিল')}
                className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60"
              >
                🔍 জমির দলিল
              </button>
            </div>

          </div>
        </div>

        {/* Warning banner if current member is pending */}
        {currentUser.status === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? 'আপনার পারিবারিক সদস্য অ্যাকাউন্টটি প্রশাসক মারুফের অনুমোদনের অপেক্ষায় রয়েছে। অনুমোদিত হলে সকল উন্মুক্ত নথি দেখতে পারবেন।' 
                  : 'Your account is pending approval by Administrator Maruf. Once approved, you can view family documents.'}
              </span>
            </div>
            <button
              onClick={() => handleSwitchUser(INITIAL_ADMIN)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              মারুফ (এডমিন) হিসেবে দেখুন
            </button>
          </div>
        )}

        {currentTab === 'vault' && (
          <div className="space-y-6">
            {/* View Mode Switcher Header: Locker Hub vs Classic Legal Vault */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setVaultDisplayMode('locker')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
                    vaultDisplayMode === 'locker'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'পারিবারিক লকার হাব (পাসওয়ার্ড, ঠিকানা, ছবি, নথি)' : 'Family Locker Hub (All Media)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVaultDisplayMode('detailed')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
                    vaultDisplayMode === 'detailed'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ঐতিহ্যবাহী আইনি দলিলপত্র ভিউ' : 'Classic Legal Vault View'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleDriveModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center space-x-1.5 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                >
                  <HardDrive className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isDriveConnected ? (lang === 'bn' ? 'গুগল ড্রাইভ সক্রিয়' : 'Drive Active') : (lang === 'bn' ? 'গুগল ড্রাইভ এক্সপ্লোরার' : 'Google Drive')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGeniusManagerModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center space-x-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'bn' ? 'জিনিয়াস ম্যানেজার' : 'Genius Helping Manager'}</span>
                </button>
              </div>
            </div>

            {/* Display Either Family Locker View or Classic Vault View */}
            {vaultDisplayMode === 'locker' ? (
              <FamilyLockerView
                currentUser={currentUser}
                members={members}
                documents={documents}
                lockerEntries={lockerEntries}
                lang={lang}
                isBiometricUnlocked={isBiometricUnlocked}
                onOpenBiometrics={() => handleTriggerBiometricUnlock()}
                onAddLockerEntry={handleAddLockerEntry}
                onUpdateLockerEntry={handleUpdateLockerEntry}
                onDeleteLockerEntry={handleDeleteLockerEntry}
                onToggleHideEntry={handleToggleHideEntry}
                onTogglePinEntry={handleTogglePinEntry}
                onAddDocument={handleAddDocument}
                onDeleteDocument={handleDeleteDocument}
                onTogglePinDoc={handleTogglePin}
                onToggleHideDoc={handleToggleHide}
                onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
                onClearBlank={handleClearAllDemo}
                onResetDemo={handleResetToDemo}
              />
            ) : (
              <VaultView
                documents={documents}
                currentUser={currentUser}
                members={members}
                onAddDocument={handleAddDocument}
                onTogglePin={handleTogglePin}
                onToggleHide={handleToggleHide}
                onDeleteDocument={handleDeleteDocument}
                onRequestAccess={handleRequestAccess}
                lang={lang}
                isBiometricUnlocked={isBiometricUnlocked}
                onTriggerBiometricUnlock={handleTriggerBiometricUnlock}
                externalSearchQuery={vaultSearchQuery}
                onSearchChange={setVaultSearchQuery}
                onClearAllDemo={handleClearAllDemo}
                onResetToDemo={handleResetToDemo}
              />
            )}
          </div>
        )}

        {currentTab === 'advisor' && (
          <AIAdvisorChat
            lang={lang}
            aiConfig={aiConfig}
          />
        )}

        {currentTab === 'hotlines' && (
          <HotlinesView
            lang={lang}
          />
        )}

        {currentTab === 'lab' && (
          <AILabView
            aiConfig={aiConfig}
            onUpdateAiConfig={setAiConfig}
            lang={lang}
          />
        )}

        {currentTab === 'admin' && (
          <AdminBackupPanel
            currentUser={currentUser}
            members={members}
            requests={requests}
            onApproveMember={handleApproveMember}
            onRemoveMember={handleRemoveMember}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onAddMember={handleAddMember}
            onEditMember={(member) => {
              setEditingMember(member);
              setShowEditProfileModal(true);
            }}
            theme={theme}
            setTheme={setTheme}
            lang={lang}
            setLang={setLang}
          />
        )}

      </main>

      {/* Footer Assurance */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              মারুফের পরিবার (Marufer Poribaar) • সিকিউর ভল্ট ও নাগরিক আইন ল্যাব
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Google Drive Encrypted</span>
            <span>•</span>
            <span>GitHub Secure Mirror</span>
            <span>•</span>
            <span>Firebase Auth</span>
            <span>•</span>
            <span>Gemini 3.8 Flash</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            Admin: habiburmaruf@gmail.com
          </div>
        </div>
      </footer>

      {/* Member Profile Switcher Modal */}
      {showUserSwitcherModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'পারিবারিক সদস্য প্রোফাইল নির্বাচন' : 'Switch Family Member Profile'}
                </h3>
              </div>
              <button
                onClick={() => setShowUserSwitcherModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500 dark:text-slate-400 my-3 leading-relaxed">
              {lang === 'bn'
                ? 'পরিবারের যে কোনো সদস্যের ভিউ পরীক্ষা করতে নিচে ক্লিক করুন অথবা আপনার ব্যক্তিগত ইমেইল ও পিন দিয়ে লগইন করুন:'
                : 'Select an approved family member to preview their personalized vault or enter email & PIN:'}
            </p>

            {/* Quick Member List */}
            <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
              {members.map(member => (
                <div
                  key={member.id}
                  onClick={() => handleSwitchUser(member)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    currentUser.id === member.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0 text-xs">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name[0]
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{member.nameBn || member.name}</span>
                        {member.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500 text-white font-bold">ADMIN</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {member.relationship} ({member.email})
                      </div>
                    </div>
                  </div>

                  {currentUser.id === member.id && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Direct Email / PIN Sign In Form */}
            <form onSubmit={handleCustomLogin} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                {lang === 'bn' ? 'নতুন পারিবারিক ইমেইল দিয়ে সাইন ইন:' : 'Sign in with personal family email:'}
              </span>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="habiburmaruf@gmail.com বা অন্য ইমেইল"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <input
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                placeholder="৪ ডিজিট নিরাপত্তা পিন (যেমন: 7860)"
                maxLength={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
              {loginError && (
                <div className="text-rose-500 text-[11px] font-semibold">{loginError}</div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1.5 shadow-md"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নিরাপদ লগইন / আবেদন' : 'Secure Sign In'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Unlock Modal with Simulated Gestures and WebAuthn */}
      <BiometricUnlockModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleBiometricSuccess}
        currentUser={currentUser}
        lang={lang}
        targetDocTitle={biometricTargetDocTitle}
      />

      {/* Edit Profile & Picture Modal */}
      {editingMember && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => {
            setShowEditProfileModal(false);
            setEditingMember(null);
          }}
          member={editingMember}
          onSave={handleSaveMemberProfile}
          lang={lang}
          isAdminViewing={currentUser.role === 'admin'}
        />
      )}

      {/* Google Drive Workspace File Explorer & Importer Modal */}
      {showGoogleDriveModal && (
        <GoogleDriveExplorer
          currentUser={currentUser}
          lang={lang}
          onImportToVault={handleImportDriveToVault}
          onImportToLocker={handleImportDriveToLocker}
          onClose={() => setShowGoogleDriveModal(false)}
        />
      )}

      {/* Genius Helping Manager Realtime Agentic Assistant Modal */}
      <GeniusHelpingManager
        currentUser={currentUser}
        lang={lang}
        documents={documents}
        lockerEntries={lockerEntries}
        isBiometricUnlocked={isBiometricUnlocked}
        isOpen={showGeniusManagerModal}
        onClose={() => setShowGeniusManagerModal(false)}
        onNavigateTab={(tab) => {
          if (tab === 'locker') {
            setCurrentTab('vault');
            setVaultDisplayMode('locker');
          } else {
            setCurrentTab(tab);
          }
        }}
        onSearchVault={(query) => {
          setVaultSearchQuery(query);
          setCurrentTab('vault');
        }}
        onTriggerBiometrics={() => handleTriggerBiometricUnlock()}
        onOpenGoogleDrive={() => {
          setShowGeniusManagerModal(false);
          setShowGoogleDriveModal(true);
        }}
      />

    </div>
  );
};

export default App;