/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FamilyMember, 
  VaultDocument, 
  LockerEntry, 
  LockerType, 
  AppLanguage, 
  SecurityLevel 
} from '../types';
import { 
  Key, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  FileSignature, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Pin, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Sparkles, 
  Filter,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Download,
  Share2
} from 'lucide-react';
import { parseGoogleDriveUrl } from '../services/googleDriveHelper';
import { exportVaultDocumentToPDF } from '../services/pdfExportService';

interface FamilyLockerViewProps {
  currentUser: FamilyMember;
  members: FamilyMember[];
  documents: VaultDocument[];
  lockerEntries: LockerEntry[];
  lang: AppLanguage;
  isBiometricUnlocked: boolean;
  onOpenBiometrics: () => void;
  onAddLockerEntry: (entry: Omit<LockerEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateLockerEntry: (id: string, updates: Partial<LockerEntry>) => void;
  onDeleteLockerEntry: (id: string) => void;
  onToggleHideEntry: (id: string) => void;
  onTogglePinEntry: (id: string) => void;
  onAddDocument: (doc: Partial<VaultDocument>) => void;
  onDeleteDocument: (docId: string) => void;
  onTogglePinDoc: (docId: string) => void;
  onToggleHideDoc: (docId: string) => void;
  onOpenGoogleDrive: () => void;
  onClearBlank: () => void;
  onResetDemo: () => void;
}

export const FamilyLockerView: React.FC<FamilyLockerViewProps> = ({
  currentUser,
  members,
  documents,
  lockerEntries,
  lang,
  isBiometricUnlocked,
  onOpenBiometrics,
  onAddLockerEntry,
  onUpdateLockerEntry,
  onDeleteLockerEntry,
  onToggleHideEntry,
  onTogglePinEntry,
  onAddDocument,
  onDeleteDocument,
  onTogglePinDoc,
  onToggleHideDoc,
  onOpenGoogleDrive,
  onClearBlank,
  onResetDemo,
}) => {
  const isBn = lang === 'bn';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'co_admin';

  // Active category tab in Locker
  const [activeTab, setActiveTab] = useState<'all' | 'passwords' | 'addresses' | 'documents' | 'images' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<'all' | 'mine'>('all');

  // Revealed passwords state (id -> boolean)
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal for Adding / Editing Locker Item
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LockerEntry | null>(null);

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<{ type: 'locker' | 'doc'; id: string; title: string } | null>(null);

  // Image preview zoom modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [formType, setFormType] = useState<LockerType>('password');
  const [formTitle, setFormTitle] = useState('');
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formSecurityLevel, setFormSecurityLevel] = useState<SecurityLevel>('public_family');
  
  // Specific fields
  const [formServiceName, setFormServiceName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formSecretPassword, setFormSecretPassword] = useState('');
  const [formPortalUrl, setFormPortalUrl] = useState('');

  const [formAddressType, setFormAddressType] = useState<'ancestral_homestead' | 'residence' | 'land_location' | 'office' | 'emergency'>('ancestral_homestead');
  const [formAddressLine, setFormAddressLine] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formThana, setFormThana] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMapCoordinates, setFormMapCoordinates] = useState('');

  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formNoteContent, setFormNoteContent] = useState('');
  const [formTags, setFormTags] = useState('');

  const openAddModal = (type: LockerType = 'password') => {
    setEditingItem(null);
    setFormType(type);
    setFormTitle('');
    setFormTitleBn('');
    setFormSecurityLevel('public_family');
    setFormServiceName('');
    setFormUsername('');
    setFormSecretPassword('');
    setFormPortalUrl('');
    setFormAddressType('ancestral_homestead');
    setFormAddressLine('');
    setFormDistrict('');
    setFormThana('');
    setFormPhone('');
    setFormMapCoordinates('');
    setFormImageUrl('');
    setFormCaption('');
    setFormNoteContent('');
    setFormTags('');
    setShowAddModal(true);
  };

  const openEditModal = (item: LockerEntry) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormTitleBn(item.titleBn);
    setFormSecurityLevel(item.securityLevel);
    setFormServiceName(item.serviceName || '');
    setFormUsername(item.username || '');
    setFormSecretPassword(item.secretPassword || '');
    setFormPortalUrl(item.portalUrl || '');
    setFormAddressType(item.addressType || 'ancestral_homestead');
    setFormAddressLine(item.addressLine || '');
    setFormDistrict(item.district || '');
    setFormThana(item.thana || '');
    setFormPhone(item.phone || '');
    setFormMapCoordinates(item.mapCoordinates || '');
    setFormImageUrl(item.imageUrl || '');
    setFormCaption(item.caption || '');
    setFormNoteContent(item.noteContent || '');
    setFormTags(item.tags?.join(', ') || '');
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingItem) {
      onUpdateLockerEntry(editingItem.id, {
        title: formTitle,
        titleBn: formTitleBn || formTitle,
        securityLevel: formSecurityLevel,
        serviceName: formServiceName,
        username: formUsername,
        secretPassword: formSecretPassword,
        portalUrl: formPortalUrl,
        addressType: formAddressType,
        addressLine: formAddressLine,
        district: formDistrict,
        thana: formThana,
        phone: formPhone,
        mapCoordinates: formMapCoordinates,
        imageUrl: formImageUrl,
        caption: formCaption,
        noteContent: formNoteContent,
        tags: tagsArray,
      });
    } else {
      onAddLockerEntry({
        type: formType,
        title: formTitle,
        titleBn: formTitleBn || formTitle,
        ownerEmail: currentUser.email,
        ownerName: currentUser.name,
        securityLevel: formSecurityLevel,
        isPinned: false,
        isHidden: false,
        serviceName: formServiceName,
        username: formUsername,
        secretPassword: formSecretPassword,
        portalUrl: formPortalUrl,
        addressType: formAddressType,
        addressLine: formAddressLine,
        district: formDistrict,
        thana: formThana,
        phone: formPhone,
        mapCoordinates: formMapCoordinates,
        imageUrl: formImageUrl,
        caption: formCaption,
        noteContent: formNoteContent,
        tags: tagsArray,
      });
    }

    setShowAddModal(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordReveal = (id: string) => {
    if (!isBiometricUnlocked) {
      onOpenBiometrics();
      return;
    }
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter locker entries
  const filteredLockerEntries = lockerEntries.filter(entry => {
    // Tab filter
    if (activeTab === 'passwords' && entry.type !== 'password') return false;
    if (activeTab === 'addresses' && entry.type !== 'address') return false;
    if (activeTab === 'images' && entry.type !== 'image') return false;
    if (activeTab === 'notes' && entry.type !== 'note') return false;
    if (activeTab === 'documents') return false; // Handled separately in docs tab

    // Owner filter
    if (selectedOwner === 'mine' && entry.ownerEmail !== currentUser.email) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title.toLowerCase().includes(q) || entry.titleBn.toLowerCase().includes(q);
      const matchTags = entry.tags?.some(t => t.toLowerCase().includes(q));
      const matchUser = entry.username?.toLowerCase().includes(q);
      const matchService = entry.serviceName?.toLowerCase().includes(q);
      const matchAddr = entry.addressLine?.toLowerCase().includes(q) || entry.thana?.toLowerCase().includes(q) || entry.district?.toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchUser && !matchService && !matchAddr) return false;
    }

    return true;
  });

  // Filter vault documents
  const filteredDocuments = documents.filter(doc => {
    if (activeTab !== 'all' && activeTab !== 'documents') return false;
    if (selectedOwner === 'mine' && doc.ownerEmail !== currentUser.email) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q) || doc.titleBn.toLowerCase().includes(q);
      const matchDocType = doc.docType?.toLowerCase().includes(q);
      const matchTags = doc.tags?.some(t => t.toLowerCase().includes(q));
      const matchOwner = doc.ownerName?.toLowerCase().includes(q);
      const matchNum = doc.docNumber?.toLowerCase().includes(q);
      if (!matchTitle && !matchDocType && !matchTags && !matchOwner && !matchNum) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Locker Navigation & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'লকার সামগ্রী' : 'All Locker'}</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
                {lockerEntries.length + documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'দলিল ও নথি' : 'Documents'}</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('passwords')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'passwords'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'পাসওয়ার্ড ও পিন' : 'Passwords'}</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
                {lockerEntries.filter(e => e.type === 'password').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'addresses'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>{isBn ? 'পৈতৃক ভিটা ও ঠিকানা' : 'Addresses'}</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
                {lockerEntries.filter(e => e.type === 'address').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'images'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>{isBn ? 'ছবি ও অ্যালবাম' : 'Photos'}</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900/60">
                {lockerEntries.filter(e => e.type === 'image').length}
              </span>
            </button>
          </div>

          {/* Right Action Hub: Add New, Google Drive, Blank/Demo */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => openAddModal(activeTab === 'passwords' ? 'password' : activeTab === 'addresses' ? 'address' : activeTab === 'images' ? 'image' : 'password')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs md:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন সংরক্ষণ করুন' : 'Add to Locker'}</span>
            </button>

            <button
              onClick={onOpenGoogleDrive}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs md:text-sm font-semibold transition-colors"
            >
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>{isBn ? 'ড্রাইভ আমদানি' : 'Drive Sync'}</span>
            </button>

            {/* Blank Vault & Restore Options */}
            <button
              onClick={onClearBlank}
              title={isBn ? 'সব ডেমো ডাটা মুছে ব্ল্যাঙ্ক লকার শুরু করুন' : 'Clear demo data and start clean'}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
            >
              {isBn ? 'ব্ল্যাঙ্ক লকার' : 'Clean Slate'}
            </button>

            <button
              onClick={onResetDemo}
              title={isBn ? 'নমুনা ভল্ট ডাটা ফিরিয়ে আনুন' : 'Reset to sample records'}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
            >
              {isBn ? 'নমুনা ডাটা' : 'Demo'}
            </button>
          </div>
        </div>

        {/* Search & Filter row */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'লকারে পাসওয়ার্ড, দাগ নং, জমির দলিল, পিতা বা ঠিকানা খুঁজুন...' : 'Search passwords, land dag no, deed, father or address in locker...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setSelectedOwner('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedOwner === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'সকল সদস্য' : 'All Family'}
              </button>
              <button
                onClick={() => setSelectedOwner('mine')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedOwner === 'mine' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'আমার নিজস্ব' : 'Mine Only'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        
        {/* SECTION 1: PASSWORDS & CREDENTIALS */}
        {(activeTab === 'all' || activeTab === 'passwords') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'পাসওয়ার্ড, পিন ও অনলাইন লগইন লকার' : 'Passwords, PINs & Credentials Locker'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredLockerEntries.filter(e => e.type === 'password').length}
                </span>
              </div>

              {!isBiometricUnlocked && (
                <button
                  onClick={onOpenBiometrics}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পাসওয়ার্ড দেখতে আনলক করুন' : 'Unlock to view passwords'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLockerEntries.filter(e => e.type === 'password').map((item) => {
                const isRevealed = revealedPasswords[item.id] || false;
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between ${
                      item.isPinned ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
                    } ${item.isHidden ? 'opacity-60' : ''}`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.serviceName || (isBn ? 'লগইন' : 'Portal')}
                          </span>
                          {item.isPinned && (
                            <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          )}
                        </div>

                        {/* Owner Badge */}
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {item.ownerName}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-2">
                        {isBn ? item.titleBn : item.title}
                      </h4>

                      {/* Username */}
                      {item.username && (
                        <div className="mb-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                          <span className="text-slate-400">{isBn ? 'ইউজারনেম / আইডি:' : 'Username:'}</span>
                          <span className="text-slate-200 font-mono font-medium">{item.username}</span>
                        </div>
                      )}

                      {/* Password Field with Hide / Reveal */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="font-mono text-xs md:text-sm text-amber-300 font-bold tracking-wider truncate">
                          {isRevealed && isBiometricUnlocked ? (
                            item.secretPassword || '••••••••••••'
                          ) : (
                            '••••••••••••••••'
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Reveal/Hide toggle */}
                          <button
                            onClick={() => togglePasswordReveal(item.id)}
                            title={isRevealed ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখুন' : 'Reveal')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          >
                            {isRevealed && isBiometricUnlocked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* Copy password */}
                          <button
                            onClick={() => copyToClipboard(item.secretPassword || '', item.id)}
                            title={isBn ? 'পাসওয়ার্ড কপি করুন' : 'Copy password'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Portal Link */}
                      {item.portalUrl && (
                        <a
                          href={item.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 mt-2 transition-colors"
                        >
                          <span>{item.portalUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onTogglePinEntry(item.id)}
                          title={item.isPinned ? (isBn ? 'আনপিন' : 'Unpin') : (isBn ? 'পিন' : 'Pin')}
                          className={`p-1.5 rounded-lg transition-colors ${item.isPinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onToggleHideEntry(item.id)}
                          title={item.isHidden ? (isBn ? 'প্রকাশ করুন' : 'Unhide') : (isBn ? 'হাইড করুন' : 'Hide')}
                          className={`p-1.5 rounded-lg transition-colors ${item.isHidden ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {item.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          title={isBn ? 'সম্পাদনা করুন' : 'Edit item'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setItemToDelete({ type: 'locker', id: item.id, title: isBn ? item.titleBn : item.title })}
                          title={isBn ? 'মুছে ফেলুন' : 'Delete item'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: ADDRESSES & LAND LOCATIONS */}
        {(activeTab === 'all' || activeTab === 'addresses') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'পৈতৃক ভিটা, সম্পত্তি ও পারিবারিক ঠিকানা' : 'Ancestral Homestead & Property Addresses'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredLockerEntries.filter(e => e.type === 'address').length}
                </span>
              </div>

              <button
                onClick={() => openAddModal('address')}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন ঠিকানা যোগ' : 'Add Address'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLockerEntries.filter(e => e.type === 'address').map((item) => (
                <div
                  key={item.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between ${
                    item.isPinned ? 'border-purple-500/40 ring-1 ring-purple-500/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.addressType === 'ancestral_homestead' ? (isBn ? 'পৈতৃক ভিটা' : 'Ancestral') : (isBn ? 'বাসভবন' : 'Residence')}
                      </span>
                      {item.isPinned && <Pin className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />}
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2">
                      {isBn ? item.titleBn : item.title}
                    </h4>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 leading-relaxed">
                        {item.addressLine}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>
                          <span className="text-slate-500">{isBn ? 'থানা:' : 'Thana:'}</span> {item.thana || 'N/A'}
                        </div>
                        <div>
                          <span className="text-slate-500">{isBn ? 'জেলা:' : 'District:'}</span> {item.district || 'N/A'}
                        </div>
                      </div>

                      {item.phone && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                          <span>📞</span>
                          <span>{item.phone}</span>
                        </div>
                      )}

                      {item.mapCoordinates && (
                        <div className="text-[11px] text-blue-400 font-mono">
                          📍 {item.mapCoordinates}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTogglePinEntry(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${item.isPinned ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleHideEntry(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${item.isHidden ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {item.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete({ type: 'locker', id: item.id, title: isBn ? item.titleBn : item.title })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: DOCUMENTS & DEEDS */}
        {(activeTab === 'all' || activeTab === 'documents') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'পারিবারিক মূল দলিল, খতিয়ান ও সনদপত্র' : 'Legal Documents, Deeds & Heritage Records'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredDocuments.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => {
                const driveInfo = parseGoogleDriveUrl(doc.googleDriveUrl || doc.fileData);

                return (
                  <div
                    key={doc.id}
                    className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between ${
                      doc.isPinned ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {doc.docType}
                        </span>
                        {doc.isPinned && <Pin className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                        {isBn ? doc.titleBn : doc.title}
                      </h4>

                      <p className="text-xs text-slate-400 mb-3">
                        {isBn ? 'মালিকানা:' : 'Owner:'} <span className="text-slate-200">{doc.ownerName}</span>
                      </p>

                      {/* Image Preview if applicable */}
                      {(doc.fileType === 'image' || driveInfo.directImageUrl) && (
                        <div 
                          onClick={() => setPreviewImageUrl(driveInfo.directImageUrl || doc.fileData || null)}
                          className="w-full h-32 rounded-xl bg-slate-950 overflow-hidden relative mb-3 cursor-pointer group border border-slate-800"
                        >
                          <img
                            src={driveInfo.directImageUrl || doc.fileData}
                            alt={doc.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{isBn ? 'বড় করে দেখুন' : 'Zoom Preview'}</span>
                          </div>
                        </div>
                      )}

                      {/* Land survey details */}
                      {doc.legalDetails && (
                        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] space-y-1 mb-3">
                          {doc.legalDetails.dagNo && (
                            <div className="text-slate-300">
                              <span className="text-slate-400">{isBn ? 'দাগ নং:' : 'Dag:'}</span> <span className="font-bold text-emerald-400">{doc.legalDetails.dagNo}</span>
                              {doc.legalDetails.khatianNo && <span> | <span className="text-slate-400">{isBn ? 'খতিয়ান:' : 'Khatian:'}</span> {doc.legalDetails.khatianNo}</span>}
                            </div>
                          )}
                          {doc.legalDetails.mouza && (
                            <div className="text-slate-300 truncate">
                              <span className="text-slate-400">{isBn ? 'মৌজা:' : 'Mouza:'}</span> {doc.legalDetails.mouza}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions: PDF Export & Drive link */}
                    <div className="mt-2 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {/* PDF Export with Maruf & Familys watermark */}
                        <button
                          onClick={() => exportVaultDocumentToPDF(doc, currentUser, lang)}
                          title={isBn ? 'Maruf & Familys ওয়াটারমার্কসহ PDF ডাউনলোড' : 'Download PDF with Maruf & Familys Watermark'}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        {/* Google Drive Link if exists */}
                        {driveInfo.viewUrl && (
                          <a
                            href={driveInfo.viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isBn ? 'গুগল ড্রাইভে দেখুন' : 'View on Drive'}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onTogglePinDoc(doc.id)}
                          className={`p-1.5 rounded-lg transition-colors ${doc.isPinned ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleHideDoc(doc.id)}
                          className={`p-1.5 rounded-lg transition-colors ${doc.isHidden ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {doc.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setItemToDelete({ type: 'doc', id: doc.id, title: isBn ? doc.titleBn : doc.title })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 4: FAMILY PHOTOS & SHOWCASE */}
        {(activeTab === 'all' || activeTab === 'images') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'পারিবারিক অ্যালবাম ও স্মরণীয় আলোকচিত্র' : 'Family Showcase Photos & Heritage Album'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {filteredLockerEntries.filter(e => e.type === 'image').length}
                </span>
              </div>

              <button
                onClick={() => openAddModal('image')}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন ছবি আপলোড' : 'Add Photo'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLockerEntries.filter(e => e.type === 'image').map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div 
                      onClick={() => setPreviewImageUrl(item.imageUrl || null)}
                      className="w-full h-48 bg-slate-950 overflow-hidden relative cursor-pointer group"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{isBn ? 'ফুলস্ক্রিন প্রিভিউ' : 'View Full Image'}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="text-sm font-bold text-white mb-1">
                        {isBn ? item.titleBn : item.title}
                      </h4>
                      {item.caption && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">{item.ownerName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete({ type: 'locker', id: item.id, title: isBn ? item.titleBn : item.title })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT LOCKER ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingItem 
                ? (isBn ? 'লকার তথ্য সম্পাদনা করুন' : 'Edit Locker Item') 
                : (isBn ? 'নতুন লকার তথ্য যোগ করুন' : 'Add to Family Locker')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isBn ? 'পাসওয়ার্ড, পারিবারিক ঠিকানা বা ছবির তথ্য সম্পূর্ণ গোপন ও সুরক্ষিত থাকে।' : 'Credentials, addresses, and family assets remain encrypted and secure.'}
            </p>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Type selector (only for new item) */}
              {!editingItem && (
                <div className="grid grid-cols-4 gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFormType('password')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${formType === 'password' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
                  >
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('address')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${formType === 'address' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    {isBn ? 'ঠিকানা' : 'Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('image')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${formType === 'image' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    {isBn ? 'ছবি' : 'Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('note')}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${formType === 'note' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                  >
                    {isBn ? 'নোট' : 'Note'}
                  </button>
                </div>
              )}

              {/* Title Bangla & English */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isBn ? 'শিরোনাম (বাংলা):' : 'Title (Bengali):'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitleBn}
                  onChange={(e) => setFormTitleBn(e.target.value)}
                  placeholder={isBn ? 'যেমন: সোনালী ব্যাংক ইন্টারনেট ব্যাংকিং' : 'Title in Bengali'}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isBn ? 'শিরোনাম (English):' : 'Title (English):'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sonali Bank NetBanking"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Conditional fields for PASSWORD */}
              {formType === 'password' && (
                <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <label className="block text-xs font-medium text-amber-300 mb-1">
                      {isBn ? 'সেবা বা পোর্টাল নাম:' : 'Service / Bank Name:'}
                    </label>
                    <input
                      type="text"
                      value={formServiceName}
                      onChange={(e) => setFormServiceName(e.target.value)}
                      placeholder="e.g. Sonali Bank PLC or land.gov.bd"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-300 mb-1">
                      {isBn ? 'ইউজারনেম বা অ্যাকাউন্ট নম্বর:' : 'Username or Account ID:'}
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="username or email"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-300 mb-1">
                      {isBn ? 'গোপন পাসওয়ার্ড বা পিন (লকারে এনক্রিপ্ট থাকবে):' : 'Secret Password or PIN:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formSecretPassword}
                      onChange={(e) => setFormSecretPassword(e.target.value)}
                      placeholder="Enter secret password or PIN"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-300 mb-1">
                      {isBn ? 'ওয়েব লিঙ্ক (ঐচ্ছিক):' : 'Website Link:'}
                    </label>
                    <input
                      type="url"
                      value={formPortalUrl}
                      onChange={(e) => setFormPortalUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Conditional fields for ADDRESS */}
              {formType === 'address' && (
                <div className="space-y-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      {isBn ? 'ঠিকানার ধরণ:' : 'Address Type:'}
                    </label>
                    <select
                      value={formAddressType}
                      onChange={(e: any) => setFormAddressType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ancestral_homestead">{isBn ? 'পৈতৃক ভিটা / জমিদারী বাড়ি' : 'Ancestral Homestead'}</option>
                      <option value="residence">{isBn ? 'পারিবারিক বাসভবন (ঢাকা/শহর)' : 'Family Residence'}</option>
                      <option value="land_location">{isBn ? 'জমির অবস্থান ও মৌজা দাগ' : 'Land Mouza Location'}</option>
                      <option value="emergency">{isBn ? 'জরুরি হাসপাতাল বা স্থানীয় কার্যালয়' : 'Emergency Hospital/Registry'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      {isBn ? 'পূর্ণ ঠিকানা ও দাগ/খতিয়ান:' : 'Full Address Line:'}
                    </label>
                    <textarea
                      rows={2}
                      value={formAddressLine}
                      onChange={(e) => setFormAddressLine(e.target.value)}
                      placeholder={isBn ? 'বাড়ি নং, রোড নং, মৌজা ও দাগ নম্বর...' : 'House, Road, Mouza, Dag No...'}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-purple-300 mb-1">
                        {isBn ? 'থানা / উপজেলা:' : 'Thana / Upazila:'}
                      </label>
                      <input
                        type="text"
                        value={formThana}
                        onChange={(e) => setFormThana(e.target.value)}
                        placeholder="e.g. Sonargaon"
                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-300 mb-1">
                        {isBn ? 'জেলা:' : 'District:'}
                      </label>
                      <input
                        type="text"
                        value={formDistrict}
                        onChange={(e) => setFormDistrict(e.target.value)}
                        placeholder="e.g. Narayanganj"
                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">
                      {isBn ? 'ফোন নম্বর:' : 'Phone Contact:'}
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white"
                    />
                  </div>
                </div>
              )}

              {/* Conditional fields for IMAGE */}
              {formType === 'image' && (
                <div className="space-y-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div>
                    <label className="block text-xs font-medium text-blue-300 mb-1">
                      {isBn ? 'ছবির URL বা গুগল ড্রাইভ শেয়ার লিঙ্ক:' : 'Image URL or Google Drive Link:'}
                    </label>
                    <input
                      type="url"
                      required
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or direct image URL"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-blue-300 mb-1">
                      {isBn ? 'ক্যাপশন বা বিবরণ:' : 'Caption / Memory:'}
                    </label>
                    <textarea
                      rows={2}
                      value={formCaption}
                      onChange={(e) => setFormCaption(e.target.value)}
                      placeholder={isBn ? 'এই ছবির স্মৃতি বা বিবরণ লিখুন...' : 'Describe this family memory...'}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isBn ? 'ট্যাগসমূহ (কমা দিয়ে আলাদা করুন):' : 'Tags (comma separated):'}
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="বাবা, ব্যাংক, পাসওয়ার্ড, সোনারগাঁও"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs md:text-sm text-white"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform active:scale-95"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-1">
              {isBn ? 'মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Deletion'}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 text-center mb-4">
              {isBn
                ? `আপনি কি নিশ্চিতভাবে "${itemToDelete.title}" লকার থেকে মুছে ফেলতে চান?`
                : `Are you sure you want to remove "${itemToDelete.title}" from the family locker?`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (itemToDelete.type === 'locker') {
                    onDeleteLockerEntry(itemToDelete.id);
                  } else {
                    onDeleteDocument(itemToDelete.id);
                  }
                  setItemToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-colors"
              >
                {isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      {previewImageUrl && (
        <div 
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img 
              src={previewImageUrl} 
              alt="Family Photo Fullscreen" 
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
