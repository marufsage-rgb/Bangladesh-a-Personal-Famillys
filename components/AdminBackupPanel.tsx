/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cloud, 
  Database, 
  Folder, 
  Server, 
  Lock, 
  Download, 
  Upload, 
  UserCheck, 
  UserPlus, 
  Trash2, 
  Check, 
  X, 
  Palette, 
  Volume2, 
  Globe, 
  RefreshCw, 
  Key,
  AlertCircle,
  FileCheck2,
  HardDrive,
  UserCog
} from 'lucide-react';
import { FamilyMember, AccessRequest, AppTheme, AppLanguage, BackupDestination } from '../types';
import { INITIAL_BACKUP_DESTINATIONS, FamilyVaultService } from '../services/familyVaultService';

interface AdminBackupPanelProps {
  currentUser: FamilyMember;
  members: FamilyMember[];
  requests: AccessRequest[];
  onApproveMember: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onAddMember: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
}

export const AdminBackupPanel: React.FC<AdminBackupPanelProps> = ({
  currentUser,
  members,
  requests,
  onApproveMember,
  onRemoveMember,
  onApproveRequest,
  onRejectRequest,
  onAddMember,
  onEditMember,
  theme,
  setTheme,
  lang,
  setLang
}) => {
  const [backupDestinations, setBackupDestinations] = useState<BackupDestination[]>(INITIAL_BACKUP_DESTINATIONS);
  const [isExporting, setIsExporting] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // New Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNameBn, setNewMemberNameBn] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRelationship, setNewMemberRelationship] = useState('পারিবারিক সদস্য (Family Member)');
  const [newMemberPin, setNewMemberPin] = useState('1234');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'co_admin'>('member');

  const isAdmin = currentUser.role === 'admin';

  const handleExportBackup = () => {
    setIsExporting(true);
    setTimeout(() => {
      const json = FamilyVaultService.exportFullVaultJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Marufer_Poribaar_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsExporting(false);
    }, 600);
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = FamilyVaultService.importVaultJSON(content);
      if (success) {
        setRestoreMessage(lang === 'bn' ? 'সফলভাবে ভল্ট ব্যাকআপ রিস্টোর হয়েছে! রিলোড করা হচ্ছে...' : 'Vault restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setRestoreMessage(lang === 'bn' ? 'ত্রুটি: ব্যাকআপ ফাইলটি সঠিক নয়।' : 'Error: Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;

    const member: FamilyMember = {
      id: `member_${Date.now()}`,
      name: newMemberName,
      nameBn: newMemberNameBn || newMemberName,
      email: newMemberEmail,
      relationship: newMemberRelationship,
      relationshipBn: newMemberRelationship,
      role: newMemberRole,
      pin: newMemberPin || '1234',
      status: 'approved',
      joinedAt: Date.now(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      requestedAccessDocs: []
    };

    onAddMember(member);
    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pendingMembers = members.filter(m => m.status === 'pending');

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'হাবিবুর রহমান মারুফ ব্যক্তিগত ও পারিবারিক কন্ট্রোল প্যানেল' : 'Habibur Rahman Maruf Personal Master Panel'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
            {lang === 'bn' ? 'ক্লাউড হোস্টিং, ব্যাকআপ ও এডমিন প্যানেল' : 'Cloud Hosting, Backup Registry & Admin Panel'}
          </h2>
          <p className="text-amber-100/80 text-xs md:text-sm mt-2 leading-relaxed">
            {lang === 'bn'
              ? 'গুগল ড্রাইভ, গিটহাব, ফায়ারবেস, ভার্সেল ও এআই স্টুডিওতে পারিবারিক তথ্যের ব্যাকআপ সিঙ্ক পর্যবেক্ষণ, সদস্যদের প্রবেশাধিকার অনুমোদন এবং এক ক্লিকে সম্পূর্ণ এনক্রিপ্টেড ব্যাকআপ ডাউনলোড।'
              : 'Monitor Google Drive, GitHub, Firebase, Vercel, and AI Studio cloud mirror synchronizations, manage access approvals, and download encrypted JSON snapshots.'}
          </p>
        </div>
      </div>

      {/* Cloud Backup Sync Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'bn' ? 'মারুফ ব্যক্তিগত হোস্টিং ও ৫-লেয়ার ক্লাউড ব্যাকআপ স্টেটাস' : 'Maruf Hosting & 5-Layer Cloud Backup Status'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'তথ্য কোনো অবস্থাতেই হারাবে না এবং কোনো তৃতীয় পক্ষের নিকট ফাঁস হবে না' : 'Zero-leak guarantee with distributed encrypted vaults'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'ব্যাকআপ তৈরি হচ্ছে...' : (lang === 'bn' ? 'সম্পূর্ণ ভল্ট ডাউনলোড করুন (JSON)' : 'Export Full Vault JSON')}</span>
            </button>

            <label className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer border border-slate-200 dark:border-slate-700">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'রিস্টোর' : 'Restore'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackupFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {restoreMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-bold">
            ✓ {restoreMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backupDestinations.map(dest => (
            <div 
              key={dest.id}
              className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>{dest.provider}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {dest.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {lang === 'bn' ? dest.nameBn : dest.name}
                </h4>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {dest.account}
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bangla">
                {dest.descriptionBn}
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                <span>{dest.encryption}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{dest.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Requests Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'bn' ? 'মরহুম বাবার সংরক্ষিত নথির অনুমোদন কিউ (Access Requests)' : 'Father\'s Heritage Archive Access Requests'}
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {pendingRequests.length} {lang === 'bn' ? 'টি আবেদন অপেক্ষমাণ' : 'pending'}
          </span>
        </div>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">কোনো অ্যাক্সেস রিকোয়েস্ট নেই।</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div 
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">{req.requesterName}</span>
                    <span className="text-slate-400">({req.requesterEmail})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                    নথি: {req.docTitle}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    কারণ: "{req.reason}"
                  </p>
                </div>

                {req.status === 'pending' && isAdmin && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>অনুমোদন দিন</span>
                    </button>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family Members Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'bn' ? 'অনুমোদিত পারিবারিক সদস্য তালিকা ও নিরাপত্তা পিন' : 'Family Member Permissions & Security'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'শুধুমাত্র অনুমোদিত সদস্যরা তাদের ব্যক্তিগত এনআইডি, পাসপোর্ট ও পারিবারিক নথি দেখতে পারেন' : 'Approved members only'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? '+ নতুন সদস্য যুক্ত করুন' : '+ Add Member'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map(member => (
            <div 
              key={member.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0">
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
                    {member.status === 'pending' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500 text-white font-bold">PENDING APPROVAL</span>
                    )}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {member.relationship} • {member.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {onEditMember && (
                  <button
                    onClick={() => onEditMember(member)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                    title={lang === 'bn' ? 'প্রোফাইল ও ছবি এডিট করুন' : 'Edit Member Profile & Picture'}
                  >
                    <UserCog className="w-3.5 h-3.5" />
                  </button>
                )}

                {isAdmin && member.id !== currentUser.id && (
                  <>
                    {member.status === 'pending' ? (
                      <button
                        onClick={() => onApproveMember(member.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                      >
                        অনুমোদন
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm('আপনি কি এই সদস্যকে অপসারণ করতে চান?')) {
                            onRemoveMember(member.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Web App Appearance & Themes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ওয়েব অ্যাপ থিম ও ভাষা কাস্টমাইজেশন' : 'Web App Themes & Customization'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setTheme('emerald')}
            className={`p-3 rounded-xl border text-left transition-all ${
              theme === 'emerald'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 mb-2"></div>
            <div className="font-bold text-xs">বাংলাদেশ এমারেল্ড</div>
            <div className="text-[10px] text-slate-500">Emerald Heritage</div>
          </button>

          <button
            onClick={() => setTheme('midnight')}
            className={`p-3 rounded-xl border text-left transition-all ${
              theme === 'midnight'
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-indigo-600 mb-2"></div>
            <div className="font-bold text-xs">মিডনাইট রয়্যাল</div>
            <div className="text-[10px] text-slate-500">Midnight Deep Blue</div>
          </button>

          <button
            onClick={() => setTheme('titanium')}
            className={`p-3 rounded-xl border text-left transition-all ${
              theme === 'titanium'
                ? 'border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ring-2 ring-slate-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-700 mb-2"></div>
            <div className="font-bold text-xs">টাইটানিয়াম ডার্ক</div>
            <div className="text-[10px] text-slate-500">Slate Security</div>
          </button>

          <button
            onClick={() => setTheme('amber')}
            className={`p-3 rounded-xl border text-left transition-all ${
              theme === 'amber'
                ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-amber-600 mb-2"></div>
            <div className="font-bold text-xs">ঐতিহ্যবাহী লাল-মাটি</div>
            <div className="text-[10px] text-slate-500">Warm Terracotta</div>
          </button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              {lang === 'bn' ? 'নতুন পারিবারিক সদস্য যুক্ত করুন' : 'Add New Family Member'}
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সদস্যের নাম (বাংলা)
                </label>
                <input
                  type="text"
                  required
                  value={newMemberNameBn}
                  onChange={(e) => setNewMemberNameBn(e.target.value)}
                  placeholder="যেমন: তারিকুল ইসলাম ভূঁইয়া"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => {
                    setNewMemberEmail(e.target.value);
                    if (!newMemberName) setNewMemberName(newMemberNameBn);
                  }}
                  placeholder="family.member@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সম্পর্ক (Relationship)
                </label>
                <input
                  type="text"
                  value={newMemberRelationship}
                  onChange={(e) => setNewMemberRelationship(e.target.value)}
                  placeholder="ভাই / বোন / মাতা / সন্তান"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    লগইন পিন (৪ ডিজিট)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newMemberPin}
                    onChange={(e) => setNewMemberPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ভূমিকা (Role)
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="member">পারিবারিক সদস্য (Member)</option>
                    <option value="co_admin">সহ-প্রশাসক (Co-Admin)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
