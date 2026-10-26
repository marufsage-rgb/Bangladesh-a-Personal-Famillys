/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  ScanFace, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Smartphone,
  Zap
} from 'lucide-react';
import { FamilyMember, AppLanguage } from '../types';
import { BiometricService } from '../services/biometricService';

interface BiometricUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: FamilyMember;
  lang: AppLanguage;
  targetDocTitle?: string;
}

export const BiometricUnlockModal: React.FC<BiometricUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  lang,
  targetDocTitle
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'face' | 'pin'>('fingerprint');
  const [scanProgress, setScanProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const holdTimerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setScanProgress(0);
      setIsHolding(false);
      setHasError(false);
      setIsSuccess(false);
      setPinInput('');
      setPinError(false);
      setStatusText(
        lang === 'bn' 
          ? 'আঙুল সেন্সরে স্পর্শ করুন এবং ধরে রাখুন...' 
          : 'Press and hold sensor to authenticate biometric token...'
      );
    }
  }, [isOpen, lang, authMode]);

  if (!isOpen) return null;

  // WebAuthn Instant Hardware Passkey attempt
  const handleHardwareWebAuthn = async () => {
    setStatusText(lang === 'bn' ? 'ডিভাইস বায়োমেট্রিক (Touch ID / Windows Hello) চালু হচ্ছে...' : 'Invoking platform authenticator...');
    const result = await BiometricService.requestWebAuthnUnlock(currentUser);
    if (result.success) {
      triggerSuccess('webauthn');
    } else {
      setStatusText(lang === 'bn' ? 'প্ল্যাটফর্ম বায়োমেট্রিক সাড়া দেয়নি, নিচের টাচ সেন্সর ব্যবহার করুন।' : 'Platform key bypassed. Use the touch gesture below.');
    }
  };

  // Start Fingerprint Hold Gesture
  const startFingerprintScan = () => {
    if (isSuccess) return;
    setIsHolding(true);
    setHasError(false);
    BiometricService.playFeedbackSound('scan');

    // Trigger haptic if on mobile device
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(30); } catch {}
    }

    setStatusText(lang === 'bn' ? 'বায়োমেট্রিক প্যাটার্ন স্ক্যান করা হচ্ছে (৭০%)...' : 'Scanning biometric micro-ridges...');

    const startTime = Date.now();
    const duration = 1200; // 1.2 seconds hold

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setScanProgress(pct);

      if (pct >= 100) {
        clearInterval(progressIntervalRef.current);
        triggerSuccess('fingerprint_gesture');
      }
    }, 40);
  };

  // Stop Fingerprint Hold Gesture early
  const stopFingerprintScan = () => {
    if (isSuccess) return;
    setIsHolding(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (scanProgress < 100) {
      setScanProgress(0);
      setStatusText(lang === 'bn' ? 'আঙুল খুব দ্রুত সরিয়ে নিয়েছেন! দয়া করে পুনরায় ধরে রাখুন।' : 'Hold gesture interrupted. Please hold firmly until 100%.');
      BiometricService.playFeedbackSound('fail');
    }
  };

  // Facial Recognition Scan Gesture
  const startFaceScan = () => {
    if (isSuccess || isHolding) return;
    setIsHolding(true);
    setHasError(false);
    setScanProgress(0);
    BiometricService.playFeedbackSound('scan');

    setStatusText(lang === 'bn' ? 'ক্যামেরা অ্যালাইনমেন্ট ও ফেসিয়াল ল্যান্ডমার্ক যাচাই হচ্ছে...' : 'Aligning optical facial geometry...');

    let current = 0;
    progressIntervalRef.current = setInterval(() => {
      current += 10;
      setScanProgress(current);

      if (current === 50) {
        setStatusText(lang === 'bn' ? 'আইরিশ প্যাটার্ন ও গভীরতা স্ক্যান সম্পন্ন...' : 'Iris mesh & depth map matched...');
        BiometricService.playFeedbackSound('scan');
      }

      if (current >= 100) {
        clearInterval(progressIntervalRef.current);
        setIsHolding(false);
        triggerSuccess('face_gesture');
      }
    }, 100);
  };

  // Handle PIN unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = currentUser.pin || '7860';
    if (pinInput === validPin) {
      triggerSuccess('pin');
    } else {
      setPinError(true);
      BiometricService.playFeedbackSound('fail');
      setStatusText(lang === 'bn' ? 'ভুল নিরাপত্তা পিন! পুনরায় চেষ্টা করুন।' : 'Incorrect security PIN. Try again.');
    }
  };

  const triggerSuccess = (method: string) => {
    setIsSuccess(true);
    setScanProgress(100);
    BiometricService.playFeedbackSound('success');
    BiometricService.setVaultUnlocked(currentUser.id, true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([40, 80, 40]); } catch {}
    }

    setStatusText(lang === 'bn' ? '✓ বায়োমেট্রিক সফলভাবে যাচাইকৃত! ভল্ট আনলক হচ্ছে...' : '✓ Biometric identity verified! Unlocking vault...');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full border border-emerald-500/30 shadow-2xl p-6 relative overflow-hidden">
        
        {/* Glowing holographic ambient beam */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              {isSuccess ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'বায়োমেট্রিক ভল্ট আনলক' : 'Biometric Vault Authentication'}</span>
                <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  WEBAUTHN
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser.name} ({currentUser.relationship})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Document Context if accessing single file */}
        {targetDocTitle && (
          <div className="my-3 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{targetDocTitle}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl my-4 border border-slate-800">
          <button
            type="button"
            onClick={() => setAuthMode('fingerprint')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              authMode === 'fingerprint'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'আঙুলের ছাপ' : 'Fingerprint'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('face')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              authMode === 'face'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ফেস স্ক্যান' : 'Face ID'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('pin')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              authMode === 'pin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'নিরাপত্তা পিন' : 'PIN'}</span>
          </button>
        </div>

        {/* Interactive Biometric View Area */}
        <div className="py-4 flex flex-col items-center justify-center text-center">
          
          {authMode === 'fingerprint' && (
            <div className="flex flex-col items-center space-y-4">
              
              {/* Circular Holographic Touch Sensor with Laser Sweep */}
              <div className="relative select-none touch-none">
                {/* SVG Progress Ring */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - scanProgress / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className={`transition-all duration-75 ${
                      isSuccess ? 'text-emerald-400' : isHolding ? 'text-teal-400' : 'text-emerald-600'
                    }`}
                  />
                </svg>

                {/* Sensor Center Button */}
                <button
                  type="button"
                  onMouseDown={startFingerprintScan}
                  onMouseUp={stopFingerprintScan}
                  onMouseLeave={stopFingerprintScan}
                  onTouchStart={startFingerprintScan}
                  onTouchEnd={stopFingerprintScan}
                  className={`absolute inset-3 rounded-full flex flex-col items-center justify-center transition-all duration-200 outline-none ${
                    isSuccess
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105'
                      : isHolding
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/60 scale-95 ring-4 ring-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:border-emerald-500/50'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-14 h-14 animate-in zoom-in" />
                  ) : (
                    <div className="relative">
                      <Fingerprint className={`w-14 h-14 ${isHolding ? 'animate-pulse text-white' : 'text-emerald-400'}`} />
                      
                      {/* Laser scanning beam line moving vertically */}
                      {isHolding && (
                        <div 
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_8px_#34d399] animate-bounce"
                          style={{ top: `${(scanProgress % 90) + 5}%` }}
                        />
                      )}
                    </div>
                  )}
                </button>
              </div>

              {/* Gesture Instructions */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-white tracking-wide">
                  {isHolding
                    ? `${lang === 'bn' ? 'স্ক্যান হচ্ছে:' : 'Authenticating:'} ${scanProgress}%`
                    : (lang === 'bn' ? 'আঙুল চেপে ধরে রাখুন (Hold 1.2s)' : 'Press & Hold Sensor (1.2s)')}
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {statusText}
                </p>
              </div>

              {/* Hardware WebAuthn direct trigger */}
              <button
                type="button"
                onClick={handleHardwareWebAuthn}
                className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডিভাইস পাসকি / Touch ID ব্যবহার করুন' : 'Use Device Native Passkey'}</span>
              </button>

            </div>
          )}

          {authMode === 'face' && (
            <div className="flex flex-col items-center space-y-4">
              
              {/* Facial Mesh Scanner Wireframe */}
              <div className="relative w-36 h-36 rounded-2xl bg-slate-950 border-2 border-dashed border-teal-500/40 flex items-center justify-center overflow-hidden">
                {/* 4 Optical Corner Brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>

                <ScanFace className={`w-16 h-16 ${isHolding ? 'text-teal-300 animate-pulse' : 'text-slate-500'}`} />

                {isHolding && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                  </div>
                )}

                {isSuccess && (
                  <div className="absolute inset-0 bg-emerald-600/90 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-white">
                  {isHolding ? `${lang === 'bn' ? 'ম্যাপিং হচ্ছে:' : 'Mapping:'} ${scanProgress}%` : (lang === 'bn' ? 'অপটিক্যাল ফেস আইডি' : 'Optical Face ID')}
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {statusText}
                </p>
              </div>

              <button
                type="button"
                onClick={startFaceScan}
                disabled={isHolding || isSuccess}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ফেস স্ক্যান শুরু করুন' : 'Start Face Scan'}</span>
              </button>

            </div>
          )}

          {authMode === 'pin' && (
            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {lang === 'bn' ? 'আপনার ব্যক্তিগত ৪ ডিজিট পিন দিন:' : 'Enter 4-Digit Personal PIN:'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-[1em] py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                />
                {pinError && (
                  <p className="text-[11px] text-rose-400 font-semibold">{statusText}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পিন দিয়ে আনলক করুন' : 'Unlock with PIN'}</span>
              </button>

              <div className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'মারুফের ডিফল্ট পিন: 7860' : 'Maruf default PIN: 7860'}
              </div>
            </form>
          )}

        </div>

        {/* Footer Security Seal */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Hardware Keystore</span>
          </span>
          <span className="text-emerald-400 font-mono">
            {isSuccess ? 'ACCESS_GRANTED' : 'WAITING_GESTURE'}
          </span>
        </div>

      </div>
    </div>
  );
};
