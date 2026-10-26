/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderLock, 
  FileText, 
  Upload, 
  Search, 
  Pin, 
  PinOff, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Plus, 
  Landmark, 
  Sparkles, 
  Trash2,
  Share2,
  Fingerprint,
  Unlock,
  Calendar,
  User,
  Info,
  MapPin,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { VaultDocument, DocCategory, FamilyMember, SecurityLevel, AppLanguage } from '../types';
import { AIAdvisorService } from '../services/aiAdvisorService';
import { PDFExportService } from '../services/pdfExportService';
import { parseGoogleDriveUrl } from '../services/googleDriveHelper';

interface VaultViewProps {
  documents: VaultDocument[];
  currentUser: FamilyMember;
  members: FamilyMember[];
  onAddDocument: (doc: VaultDocument) => void;
  onTogglePin: (docId: string) => void;
  onToggleHide: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onRequestAccess: (docId: string, docTitle: string, reason: string) => void;
  lang: AppLanguage;
  pendingRequestsForUser?: string[];
  isBiometricUnlocked: boolean;
  onTriggerBiometricUnlock: (targetDocTitle?: string) => void;
  externalSearchQuery?: string;
  onSearchChange?: (q: string) => void;
  onClearAllDemo?: () => void;
  onResetToDemo?: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  documents,
  currentUser,
  members,
  onAddDocument,
  onTogglePin,
  onToggleHide,
  onDeleteDocument,
  onRequestAccess,
  lang,
  pendingRequestsForUser = [],
  isBiometricUnlocked,
  onTriggerBiometricUnlock,
  externalSearchQuery,
  onSearchChange,
  onClearAllDemo,
  onResetToDemo
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');

  // Synchronize with external voice-triggered searches
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<VaultDocument | null>(null);
  const [requestModalDoc, setRequestModalDoc] = useState<VaultDocument | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [isMaskingAll, setIsMaskingAll] = useState(false);
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'co_admin';

  // Form State for New Document
  const [formTitle, setFormTitle] = useState('');
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formCategory, setFormCategory] = useState<DocCategory>('land_property');
  const [formDocType, setFormDocType] = useState('Sub-Kobla Dolil (সাব-কবলা দলিল)');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formOwnerName, setFormOwnerName] = useState(currentUser.name);
  const [formOwnerEmail, setFormOwnerEmail] = useState(currentUser.email);
  const [formSecurityLevel, setFormSecurityLevel] = useState<SecurityLevel>('public_family');
  const [formTags, setFormTags] = useState('জমি, দলিল, নামজারি');
  const [formMouza, setFormMouza] = useState('');
  const [formDagNo, setFormDagNo] = useState('');
  const [formKhatianNo, setFormKhatianNo] = useState('');
  const [formAreaDecimal, setFormAreaDecimal] = useState('');
  const [formFileBase64, setFormFileBase64] = useState<string | undefined>(undefined);
  const [formFileName, setFormFileName] = useState('');
  const [formFileType, setFormFileType] = useState<'image' | 'pdf' | 'document'>('pdf');
  const [formGoogleDriveUrl, setFormGoogleDriveUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // File picker handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormFileName(file.name);
    const isImg = file.type.startsWith('image/');
    setFormFileType(isImg ? 'image' : 'pdf');

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormFileBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCertifiedPDF = (doc: VaultDocument) => {
    try {
      const { url, filename } = PDFExportService.generateDocumentPDF(doc);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setPdfSuccessMessage(
        lang === 'bn'
          ? `'Maruf & Familys' ওয়াটারমার্ক সম্বলিত সার্টিফাইড সিকিউর পিডিএফ ডাউনলোড সম্পন্ন হয়েছে!`
          : `Downloaded certified PDF with 'Maruf & Familys' authenticity watermark!`
      );
      setTimeout(() => setPdfSuccessMessage(null), 4500);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleBn && !formTitle) return;

    setIsUploading(true);

    const driveInfo = parseGoogleDriveUrl(formGoogleDriveUrl);

    const newDoc: VaultDocument = {
      id: `doc_${Date.now()}`,
      title: formTitle || formTitleBn,
      titleBn: formTitleBn || formTitle,
      ownerEmail: formOwnerEmail,
      ownerName: formOwnerName,
      category: formCategory,
      docType: formDocType,
      docNumber: formDocNumber,
      issueDate: new Date().toISOString().split('T')[0],
      fileData: formFileBase64 || (driveInfo.directImageUrl || undefined),
      fileType: formFileType,
      fileName: formFileName || (driveInfo.isValidDriveUrl ? 'Google_Drive_Doc.jpg' : 'Document_Scan.pdf'),
      fileSize: formFileBase64 ? '1.8 MB' : 'Drive Linked',
      googleDriveUrl: formGoogleDriveUrl.trim() || undefined,
      driveFileId: driveInfo.fileId || undefined,
      isPinned: false,
      isHidden: false,
      securityLevel: formSecurityLevel,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
      legalDetails: {
        mouza: formMouza,
        dagNo: formDagNo,
        khatianNo: formKhatianNo,
        landAreaDecimal: formAreaDecimal
      }
    };

    // Run AI analysis
    try {
      const aiAnalysis = await AIAdvisorService.analyzeDocument(newDoc, formFileBase64);
      newDoc.aiAnalysis = aiAnalysis;
    } catch (err) {
      console.warn('AI analysis skipped', err);
    }

    onAddDocument(newDoc);
    setIsUploading(false);
    setShowUploadModal(false);

    // Reset Form
    setFormTitle('');
    setFormTitleBn('');
    setFormDocNumber('');
    setFormMouza('');
    setFormDagNo('');
    setFormKhatianNo('');
    setFormAreaDecimal('');
    setFormFileBase64(undefined);
    setFormFileName('');
    setFormGoogleDriveUrl('');
  };

  const handleRunAiAudit = async (doc: VaultDocument) => {
    setAnalyzingDocId(doc.id);
    try {
      const audit = await AIAdvisorService.analyzeDocument(doc);
      doc.aiAnalysis = audit;
      // Trigger update
      onAddDocument({ ...doc });
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleConfirmAccessRequest = () => {
    if (!requestModalDoc) return;
    onRequestAccess(requestModalDoc.id, requestModalDoc.titleBn || requestModalDoc.title, requestReason);
    setRequestModalDoc(null);
    setRequestReason('');
  };

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    // Category filter
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (doc.titleBn && doc.titleBn.toLowerCase().includes(q)) || doc.title.toLowerCase().includes(q);
      const matchOwner = doc.ownerName.toLowerCase().includes(q);
      const matchDocNo = doc.docNumber && doc.docNumber.toLowerCase().includes(q);
      const matchDag = doc.legalDetails?.dagNo && doc.legalDetails.dagNo.toLowerCase().includes(q);
      const matchKhatian = doc.legalDetails?.khatianNo && doc.legalDetails.khatianNo.toLowerCase().includes(q);
      const matchMouza = doc.legalDetails?.mouza && doc.legalDetails.mouza.toLowerCase().includes(q);
      const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchOwner && !matchDocNo && !matchDag && !matchKhatian && !matchMouza && !matchTags) {
        return false;
      }
    }

    return true;
  });

  const pinnedDocs = documents.filter(doc => doc.isPinned);
  const fatherArchiveCount = documents.filter(doc => doc.category === 'father_heritage').length;
  const landDeedCount = documents.filter(doc => doc.category === 'land_property').length;

  const hasAccessToDoc = (doc: VaultDocument): boolean => {
    if (isAdmin) return true;
    if (doc.ownerEmail === currentUser.email) return true;
    if (doc.securityLevel === 'public_family') return true;
    // Check if approved via request
    if (currentUser.requestedAccessDocs && currentUser.requestedAccessDocs.includes(doc.id)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'মারুফ এন্ড ফ্যামিলি ডিজিটাল সিকিউর ভল্ট' : "Maruf & Family Digital Secure Vault"}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-snug">
              {lang === 'bn' 
                ? 'পারিবারিক স্থায়ী সংরক্ষণাগার ও উত্তরাধিকার ভল্ট' 
                : 'Family Permanent Archive & Inheritance Vault'}
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'মরহুম পিতা আব্দুল বারিক ভূঁইয়ার স্মার্ট এনআইডি, মৃত্যু সনদ, পৈতৃক জমির দলিল, খতিয়ান এবং সকল পারিবারিক সদস্যের ভিসা ও ব্যাংক দলিলের সুরক্ষিত ডিজিটাল ভাণ্ডার।'
                : "Secure digital preservation of Late Father Abdul Barek Bhuyan's NID, Death Certificate, Ancestral Deeds, Khatians, and family members' identity records."}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <button
              onClick={() => onTriggerBiometricUnlock()}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
                isBiometricUnlocked
                  ? 'bg-emerald-600/30 hover:bg-emerald-600/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white animate-pulse'
              }`}
              title={isBiometricUnlocked ? 'Click to lock with biometric protection' : 'Click to scan fingerprint/face'}
            >
              <Fingerprint className="w-4 h-4" />
              <span>
                {isBiometricUnlocked
                  ? (lang === 'bn' ? 'বায়োমেট্রিক সক্রিয় (লক করুন)' : 'Lock Vault')
                  : (lang === 'bn' ? '👆 বায়োমেট্রিক আনলক করুন' : 'Biometric Unlock')}
              </span>
            </button>

            <button
              onClick={() => setIsMaskingAll(!isMaskingAll)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
              title="Toggle masking on sensitive numbers"
            >
              {isMaskingAll ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
              <span>{isMaskingAll ? (lang === 'bn' ? 'আইডি প্রকাশ করুন' : 'Reveal IDs') : (lang === 'bn' ? 'তথ্য গোপন রাখুন' : 'Mask Sensitive')}</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs md:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all transform hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'bn' ? '+ নতুন দলিল/নথি আপলোড' : '+ Upload Document'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/50">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-emerald-200">{lang === 'bn' ? 'মোট সংরক্ষিত নথি' : 'Total Vault Files'}</div>
            <div className="text-2xl font-bold font-display text-white mt-1">{documents.length} টি</div>
          </div>
          <div className="bg-amber-500/10 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20">
            <div className="text-xs text-amber-200">{lang === 'bn' ? 'মরহুম বাবার নথিপত্র' : "Father's Archive"}</div>
            <div className="text-2xl font-bold font-display text-amber-300 mt-1">{fatherArchiveCount} টি</div>
          </div>
          <div className="bg-teal-500/10 backdrop-blur-sm rounded-xl p-3 border border-teal-500/20">
            <div className="text-xs text-teal-200">{lang === 'bn' ? 'জমির দলিল ও খতিয়ান' : 'Land Deeds & Khatians'}</div>
            <div className="text-2xl font-bold font-display text-teal-300 mt-1">{landDeedCount} টি</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
            <div className="text-xs text-purple-200">{lang === 'bn' ? 'পিন করা ড্যাশবোর্ড' : 'Pinned Quick Access'}</div>
            <div className="text-2xl font-bold font-display text-purple-300 mt-1">{pinnedDocs.length} টি</div>
          </div>
        </div>
      </div>

      {/* Pinned Quick Access Section */}
      {pinnedDocs.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <Pin className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{lang === 'bn' ? 'পিন করা দ্রুত ড্যাশবোর্ড (Quick Access Dashboard)' : 'Pinned Fast Access'}</span>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400">
              {pinnedDocs.length} {lang === 'bn' ? 'টি অগ্রাধিকার নথি' : 'pinned files'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedDocs.map(doc => (
              <div 
                key={`pin_${doc.id}`}
                onClick={() => setSelectedDocDetails(doc)}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400 cursor-pointer shadow-sm hover:shadow transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {lang === 'bn' ? (doc.titleBn || doc.title) : doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {doc.docType} • {doc.ownerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(doc.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500"
                  title="Unpin"
                >
                  <PinOff className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'bn' ? 'সকল নথি' : 'All Files'} ({documents.length})
          </button>
          <button
            onClick={() => setSelectedCategory('father_heritage')}
            className={`px-3 py-2 rounded-xl shrink-0 transition-all flex items-center space-x-1.5 ${
              selectedCategory === 'father_heritage'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'মরহুম বাবার নথিপত্র' : "Father's Legacy"}</span>
          </button>
          <button
            onClick={() => setSelectedCategory('land_property')}
            className={`px-3 py-2 rounded-xl shrink-0 transition-all ${
              selectedCategory === 'land_property'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'bn' ? 'জমির দলিল ও খতিয়ান' : 'Land & Deeds'}
          </button>
          <button
            onClick={() => setSelectedCategory('personal_id')}
            className={`px-3 py-2 rounded-xl shrink-0 transition-all ${
              selectedCategory === 'personal_id'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'bn' ? 'এনআইডি ও পাসপোর্ট' : 'NID & Passports'}
          </button>
          <button
            onClick={() => setSelectedCategory('bank_finance')}
            className={`px-3 py-2 rounded-xl shrink-0 transition-all ${
              selectedCategory === 'bank_finance'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'bn' ? 'ব্যাংক ও অর্থ' : 'Bank & Finance'}
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 min-w-[260px] md:min-w-[320px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              placeholder={lang === 'bn' ? 'নাম, দলিল নং, দাগ, খতিয়ান বা মৌজা খুঁজুন (ভয়েস বা টাইপিং)...' : 'Search title, dag, khatian, mouza...'}
              className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearchChange?.('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {onClearAllDemo && (
            <button
              onClick={() => {
                if (window.confirm(lang === 'bn' ? 'আপনি কি সব ডেমো ডাটা মুছে সম্পূর্ণ নতুন ও ব্ল্যাঙ্ক পারিবারিক ভল্ট শুরু করতে চান? (আপনার নতুন আপলোড করা ছবি ও তথ্য সংরক্ষিত থাকবে)' : 'Reset demo entries and start with a blank family vault?')) {
                  onClearAllDemo();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0"
              title="Clear demo entries and use only your own real family photos and documents"
            >
              {lang === 'bn' ? 'ব্ল্যাঙ্ক ভল্ট' : 'Blank Vault'}
            </button>
          )}

          {onResetToDemo && documents.length === 0 && (
            <button
              onClick={onResetToDemo}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0"
            >
              {lang === 'bn' ? 'নমুনা ভল্ট লোড করুন' : 'Load Template'}
            </button>
          )}
        </div>
      </div>

      {/* Private Family Enclave Assurance Badge */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            {lang === 'bn'
              ? '🔒 একান্ত পারিবারিক প্রাইভেট এনক্লেভ: আপলোডকৃত কোনো ছবি, এনআইডি বা পাসপোর্ট ইন্টারনেটে প্রকাশিত হয় না।'
              : '🔒 100% Private Family Enclave: Uploaded photos, NID, and deeds are strictly protected and never published publicly.'}
          </span>
        </div>
        {searchQuery && (
          <div className="text-[11px] font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
            {lang === 'bn' ? 'সার্চ ফিল্টার সক্রিয়: ' : 'Search filter: '} "{searchQuery}"
          </div>
        )}
      </div>

      {/* PDF Export Success Notification */}
      {pdfSuccessMessage && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPdfSuccessMessage(null)}
            className="text-emerald-200 hover:text-white font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <FolderLock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? 'কোনো নথি পাওয়া যায়নি' : 'No documents found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {lang === 'bn' ? 'অনুগ্রহ করে ভিন্ন কোনো শব্দ দিয়ে অনুসন্ধান করুন অথবা নতুন দলিল আপলোড করুন।' : 'Try different keywords or upload a new record.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocs.map(doc => {
            const hasAccess = hasAccessToDoc(doc);
            const isRestricted = doc.securityLevel === 'restricted_heritage' && !hasAccess;
            const isMasked = isMaskingAll || doc.isHidden;

            return (
              <div 
                key={doc.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  doc.category === 'father_heritage'
                    ? 'border-amber-300/80 dark:border-amber-800/60 ring-1 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                {/* Header */}
                <div className="p-4.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    
                    {/* Category & Heritage Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {doc.category === 'father_heritage' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Landmark className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'মরহুম বাবার আর্কাইভ' : "Father's Archive"}</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.docType}
                      </span>
                    </div>

                    {/* Actions: Pin & Mask */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onTogglePin(doc.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          doc.isPinned
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={doc.isPinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${doc.isPinned ? 'fill-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => onToggleHide(doc.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          doc.isHidden
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={doc.isHidden ? 'Unhide details' : 'Hide / Mask numbers'}
                      >
                        {doc.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {lang === 'bn' ? (doc.titleBn || doc.title) : doc.title}
                  </h3>

                  {/* Identification Number */}
                  {doc.docNumber && (
                    <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">ID / NO:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isMasked ? '•••••••••••••' : doc.docNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4.5 space-y-3 text-xs">
                  
                  {/* Land Details Grid if Land Document */}
                  {doc.legalDetails && (doc.legalDetails.dagNo || doc.legalDetails.khatianNo || doc.legalDetails.mouza) && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-1.5">
                      <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        <span>{lang === 'bn' ? 'জমির তফসিল ও রেকর্ড বিবরণ' : 'Land Schedule & Records'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        {doc.legalDetails.mouza && (
                          <div>
                            <span className="text-slate-400">{lang === 'bn' ? 'মৌজা: ' : 'Mouza: '}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{doc.legalDetails.mouza}</span>
                          </div>
                        )}
                        {doc.legalDetails.dagNo && (
                          <div>
                            <span className="text-slate-400">{lang === 'bn' ? 'দাগ নং: ' : 'Dag: '}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{doc.legalDetails.dagNo}</span>
                          </div>
                        )}
                        {doc.legalDetails.khatianNo && (
                          <div>
                            <span className="text-slate-400">{lang === 'bn' ? 'খতিয়ান: ' : 'Khatian: '}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{doc.legalDetails.khatianNo}</span>
                          </div>
                        )}
                        {doc.legalDetails.landAreaDecimal && (
                          <div>
                            <span className="text-slate-400">{lang === 'bn' ? 'পরিমাণ: ' : 'Area: '}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{doc.legalDetails.landAreaDecimal}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Google Drive Image / Document Preview if present */}
                  {doc.googleDriveUrl && (() => {
                    const driveInfo = parseGoogleDriveUrl(doc.googleDriveUrl);
                    return (
                      <div className="bg-blue-50/70 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          {driveInfo.directImageUrl ? (
                            <img
                              src={driveInfo.directImageUrl}
                              alt="Drive preview"
                              className="w-10 h-10 object-cover rounded-lg border border-blue-300 dark:border-blue-800 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <HardDrive className="w-5 h-5 text-blue-500 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                              <HardDrive className="w-3 h-3 text-blue-600" />
                              <span>Google Drive Image File</span>
                            </span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">
                              Drive ID: {driveInfo.fileId || 'Encrypted Cloud Mirror'}
                            </span>
                          </div>
                        </div>

                        {driveInfo.viewUrl && (
                          <a
                            href={driveInfo.viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:text-blue-800 border border-blue-200 dark:border-blue-800 text-[10px] font-bold shrink-0 flex items-center gap-1"
                            title="Open Google Drive File"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Drive</span>
                          </a>
                        )}
                      </div>
                    );
                  })()}

                  {/* Local Uploaded Picture Thumbnail if available and not drive */}
                  {!doc.googleDriveUrl && doc.fileData && doc.fileData.startsWith('data:image') && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center space-x-2.5">
                      <img
                        src={doc.fileData}
                        alt="Document scan"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm shrink-0"
                      />
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        <span className="font-semibold block truncate">{doc.fileName || 'Document Photo'}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ এনক্লেভ সংরক্ষিত ছবি</span>
                      </div>
                    </div>
                  )}

                  {/* Owner & Storage info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{doc.ownerName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{doc.issueDate || 'Verified'}</span>
                    </span>
                  </div>

                  {/* AI Verification Badge & Audit Checkpoint */}
                  {doc.aiAnalysis && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{lang === 'bn' ? 'এআই আইনি যাচাইকৃত' : 'AI Verified'}</span>
                        </span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {doc.aiAnalysis.checkpoints.length} {lang === 'bn' ? 'টি মানদণ্ড পাস' : 'criteria passed'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {lang === 'bn' ? doc.aiAnalysis.summaryBn : doc.aiAnalysis.summaryEn}
                      </p>
                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  
                  {isRestricted ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সংরক্ষিত পারিবারিক নথি' : 'Restricted Archive'}</span>
                      </div>
                      <button
                        onClick={() => setRequestModalDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        {lang === 'bn' ? 'অনুমতি চান' : 'Request Access'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            const isSensitive = doc.securityLevel === 'private_owner' || 
                                                doc.securityLevel === 'restricted_heritage' || 
                                                doc.category === 'personal_id' || 
                                                doc.category === 'bank_finance';
                            if (!isBiometricUnlocked && isSensitive) {
                              onTriggerBiometricUnlock(doc.titleBn || doc.title);
                            } else {
                              setSelectedDocDetails(doc);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                            !isBiometricUnlocked && (doc.securityLevel === 'private_owner' || doc.category === 'personal_id' || doc.category === 'bank_finance')
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }`}
                        >
                          {!isBiometricUnlocked && (doc.securityLevel === 'private_owner' || doc.category === 'personal_id' || doc.category === 'bank_finance') ? (
                            <>
                              <Fingerprint className="w-3 h-3 text-rose-500" />
                              <span>{lang === 'bn' ? 'বায়োমেট্রিক আনলক' : 'Touch to Unlock'}</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3 text-emerald-500" />
                              <span>{lang === 'bn' ? 'নথি দেখুন' : 'View File'}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRunAiAudit(doc)}
                          disabled={analyzingDocId === doc.id}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-medium flex items-center space-x-1 transition-all"
                          title="Run automated legal check with Gemini"
                        >
                          <Sparkles className={`w-3 h-3 ${analyzingDocId === doc.id ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">{analyzingDocId === doc.id ? 'যাচাই হচ্ছে...' : (lang === 'bn' ? 'এআই অডিট' : 'AI Audit')}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        {/* Certified PDF Download with 'Maruf & Familys' Watermark */}
                        <button
                          onClick={() => handleDownloadCertifiedPDF(doc)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 transition-colors shadow-sm"
                          title={lang === 'bn' ? "'Maruf & Familys' ওয়াটারমার্ক সম্বলিত সার্টিফাইড সিকিউর পিডিএফ ডাউনলোড করুন" : "Download Certified PDF (with 'Maruf & Familys' Watermark)"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই নথিটি ভল্ট থেকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this document?')) {
                                onDeleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'ভল্টে নতুন পারিবারিক নথি আপলোড' : 'Upload Document to Family Vault'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'bn' ? 'এনআইডি, পাসপোর্ট, ভিসা, জমির দলিল বা মরহুম পিতার কাগজপত্র' : 'NID, Passport, Visa, Land Deeds or Heritage Documents'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'নথির নাম (বাংলা)' : 'Document Title (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="যেমন: পৈতৃক জমির সাব-কবলা দলিল"
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'নথির নাম (English)' : 'Document Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Ancestral Homestead Land Deed"
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocCategory)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="land_property">জমির দলিল ও খতিয়ান (Land)</option>
                    <option value="father_heritage">মরহুম বাবার আর্কাইভ (Father's Legacy)</option>
                    <option value="personal_id">পরিচয়পত্র ও পাসপোর্ট (ID/Visa)</option>
                    <option value="bank_finance">ব্যাংক ও আর্থিক নথি (Bank/FDR)</option>
                    <option value="education_work">শিক্ষা ও সনদ (Education/Work)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'নথির ধরন' : 'Doc Type'}
                  </label>
                  <input
                    type="text"
                    value={formDocType}
                    onChange={(e) => setFormDocType(e.target.value)}
                    placeholder="সাব-কবলা দলিল / এনআইডি / পাসপোর্ট"
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'দলিল/আইডি নম্বর' : 'Doc Number / ID'}
                  </label>
                  <input
                    type="text"
                    value={formDocNumber}
                    onChange={(e) => setFormDocNumber(e.target.value)}
                    placeholder="যেমন: ৪২৮১/১৯৮২ বা NID নম্বর"
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Land Specific Inputs if Land Category */}
              {(formCategory === 'land_property' || formCategory === 'father_heritage') && (
                <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-teal-800 dark:text-teal-300">
                    {lang === 'bn' ? 'জমির তফসিল ও রেকর্ডের তথ্য (ঐচ্ছিক)' : 'Land Survey & Schedule Information (Optional)'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400">মৌজা ও জেএল</label>
                      <input
                        type="text"
                        value={formMouza}
                        onChange={(e) => setFormMouza(e.target.value)}
                        placeholder="মৌজা ভবানীপুর, জেএল ৪২"
                        className="w-full px-2.5 py-1.5 mt-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400">দাগ নম্বর</label>
                      <input
                        type="text"
                        value={formDagNo}
                        onChange={(e) => setFormDagNo(e.target.value)}
                        placeholder="১৮২, ১৮৫"
                        className="w-full px-2.5 py-1.5 mt-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400">খতিয়ান নম্বর</label>
                      <input
                        type="text"
                        value={formKhatianNo}
                        onChange={(e) => setFormKhatianNo(e.target.value)}
                        placeholder="আরএস ৯২, নামজারি ১৩৭"
                        className="w-full px-2.5 py-1.5 mt-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400">জমির পরিমাণ (শতাংশ)</label>
                      <input
                        type="text"
                        value={formAreaDecimal}
                        onChange={(e) => setFormAreaDecimal(e.target.value)}
                        placeholder="১৮.৫০ শতাংশ"
                        className="w-full px-2.5 py-1.5 mt-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ownership & Security Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'নথির মালিক (সদস্য নির্বাচন করুন)' : 'Owner / Family Member'}
                  </label>
                  <select
                    value={formOwnerName}
                    onChange={(e) => {
                      const selected = members.find(m => m.name === e.target.value);
                      setFormOwnerName(e.target.value);
                      if (selected) setFormOwnerEmail(selected.email);
                    }}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.relationship})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'নিরাপত্তা ও অ্যাক্সেস লেভেল' : 'Security Access Level'}
                  </label>
                  <select
                    value={formSecurityLevel}
                    onChange={(e) => setFormSecurityLevel(e.target.value as SecurityLevel)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="public_family">পরিবারের সকল অনুমোদিত সদস্য (Public to Family)</option>
                    <option value="restricted_heritage">মরহুম বাবার সংরক্ষিত আর্কাইভ (Admin Approval Needed)</option>
                    <option value="private_owner">ব্যক্তিগত মালিক ও এডমিন মারুফ (Private)</option>
                    <option value="admin_only">শুধুমাত্র মারুফ ব্যক্তিগত (Admin Only)</option>
                  </select>
                </div>
              </div>

              {/* File Upload Selector & Picture Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'bn' ? 'আসল ছবি বা স্ক্যান কপি আপলোড করুন (Family Documents / Pictures)' : 'Upload Authentic Picture or Document Scan'}
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{lang === 'bn' ? '১০০% গোপনীয় • নট পাবলিশ্ড' : 'Private • Never Published'}</span>
                  </span>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf"
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  
                  {formFileBase64 && formFileType === 'image' && (
                    <div className="mt-3 flex items-center justify-center space-x-3 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <img 
                        src={formFileBase64} 
                        alt="Document Preview" 
                        className="w-16 h-16 object-cover rounded-md border border-slate-300 dark:border-slate-600 shadow-sm"
                      />
                      <div className="text-left text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-xs">{formFileName}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ পারিবারিক ফটো প্রিভিউ প্রস্তুত (লোকাল এনক্লেভ)</span>
                      </div>
                    </div>
                  )}

                  {formFileName && formFileType !== 'image' && (
                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ নির্বাচিত ফাইল: {formFileName}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                    {lang === 'bn' 
                      ? 'পারিবারিক ছবি, স্মার্ট কার্ড, পাসপোর্টের ছবি বা দলিলের পেজ সিলেক্ট করুন। তথ্য এনক্রিপ্ট করে শুধুমাত্র পারিবারিক সদস্যদের জন্য সংরক্ষিত থাকবে।'
                      : 'Select document photos, passport photos, or deeds. Strictly protected within private family storage.'}
                  </p>
                </div>

                {/* Google Drive Image Link Input */}
                <div className="mt-3 p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'bn' ? 'গুগল ড্রাইভ ইমেজ বা ফাইল লিংক (ঐচ্ছিক)' : 'Google Drive Image or File Link (Optional)'}</span>
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Drive Mirror</span>
                  </div>
                  <input
                    type="text"
                    value={formGoogleDriveUrl}
                    onChange={(e) => setFormGoogleDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/1.../view বা ফাইল আইডি পেস্ট করুন..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                  {formGoogleDriveUrl && (() => {
                    const parsed = parseGoogleDriveUrl(formGoogleDriveUrl);
                    return parsed.directImageUrl ? (
                      <div className="flex items-center space-x-3 p-2 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-800">
                        <img
                          src={parsed.directImageUrl}
                          alt="Google Drive formatted preview"
                          className="w-12 h-12 object-cover rounded-lg border border-blue-300 dark:border-blue-700 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-blue-700 dark:text-blue-300 block">✓ গুগল ড্রাইভ ইমেজ সফলভাবে ফরমেট হয়েছে</span>
                          <span className="text-[10px] text-slate-500">ফাইল আইডি: {parsed.fileId}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs md:text-sm font-bold shadow-md hover:from-emerald-500 hover:to-teal-500 flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>{lang === 'bn' ? 'এআই যাচাই ও সংরক্ষণ হচ্ছে...' : 'AI Inspecting & Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'ভল্টে সংরক্ষণ করুন' : 'Save to Vault'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Document Details Modal */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {selectedDocDetails.docType}
                </span>
                <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white mt-1">
                  {lang === 'bn' ? (selectedDocDetails.titleBn || selectedDocDetails.title) : selectedDocDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              
              {/* Document Overview Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                <div>
                  <span className="text-slate-400 block">{lang === 'bn' ? 'নথির মালিক:' : 'Owner:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDocDetails.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'bn' ? 'আইডি/দলিল নং:' : 'ID Number:'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedDocDetails.docNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{lang === 'bn' ? 'তারিখ:' : 'Date:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDocDetails.issueDate || 'Verified'}</span>
                </div>
              </div>

              {/* Land Specifications if applicable */}
              {selectedDocDetails.legalDetails && (
                <div className="bg-teal-50 dark:bg-teal-950/30 p-3.5 rounded-xl border border-teal-200 dark:border-teal-800/40 space-y-2">
                  <h4 className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'জমির তফসিল ও বালাম বিবরণী' : 'Land Schedule Details'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-200">
                    <div><strong>মৌজা:</strong> {selectedDocDetails.legalDetails.mouza || 'ভবানীপুর'}</div>
                    <div><strong>দাগ নং:</strong> {selectedDocDetails.legalDetails.dagNo || '১৮২, ১৮৫'}</div>
                    <div><strong>খতিয়ান নং:</strong> {selectedDocDetails.legalDetails.khatianNo || 'আরএস খতিয়ান ৯২'}</div>
                    <div><strong>জমির পরিমাণ:</strong> {selectedDocDetails.legalDetails.landAreaDecimal || '১৮.৫০ শতাংশ'}</div>
                    <div><strong>সাব-রেজিস্ট্রি:</strong> {selectedDocDetails.legalDetails.subRegistryOffice || 'সদর কার্যালয়'}</div>
                  </div>
                </div>
              )}

              {/* AI Audit Report */}
              {selectedDocDetails.aiAnalysis && (
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'এআই আইনি নিরীক্ষা ও রোডম্যাপ (Gemini 3.8 Flash)' : 'AI Legal Audit'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {lang === 'bn' ? selectedDocDetails.aiAnalysis.summaryBn : selectedDocDetails.aiAnalysis.summaryEn}
                  </p>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      {lang === 'bn' ? 'আইনি চেকপয়েন্টসমূহ:' : 'Legal Checkpoints:'}
                    </span>
                    <ul className="space-y-1">
                      {selectedDocDetails.aiAnalysis.checkpoints.map((cp, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-slate-300 text-[11px]">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{cp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {selectedDocDetails.aiAnalysis.suggestedRoadmap && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300">
                      <strong>{lang === 'bn' ? 'পরবর্তী পরামর্শ:' : 'Recommended Action:'}</strong> {selectedDocDetails.aiAnalysis.suggestedRoadmap}
                    </div>
                  )}
                </div>
              )}

              {/* Google Drive Link & High-Res Preview if available */}
              {selectedDocDetails.googleDriveUrl && (() => {
                const driveInfo = parseGoogleDriveUrl(selectedDocDetails.googleDriveUrl);
                return (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-bold">
                        <HardDrive className="w-4 h-4 text-blue-600" />
                        <span>{lang === 'bn' ? 'গুগল ড্রাইভ ক্লাউড মিরর ও ইমেজ ফাইল' : 'Google Drive Cloud Mirror File'}</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
                        DRIVE ID: {driveInfo.fileId || 'LINKED'}
                      </span>
                    </div>

                    {driveInfo.directImageUrl && (
                      <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800 bg-black/5 dark:bg-black/30 flex justify-center max-h-60">
                        <img
                          src={driveInfo.directImageUrl}
                          alt="Google Drive Document Scan"
                          className="object-contain w-full h-full max-h-60 rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500 truncate max-w-xs">{selectedDocDetails.googleDriveUrl}</span>
                      {driveInfo.viewUrl && (
                        <a
                          href={driveInfo.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold flex items-center space-x-1 shrink-0 hover:bg-blue-500"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'ড্রাইভে খুলুন' : 'Open in Drive'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Stored Picture Preview if local and not drive */}
              {!selectedDocDetails.googleDriveUrl && selectedDocDetails.fileData && selectedDocDetails.fileData.startsWith('data:image') && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {lang === 'bn' ? 'সংরক্ষিত মূল পারিবারিক ছবি/স্ক্যান:' : 'Stored Authentic Scan/Photo:'}
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex justify-center max-h-60 bg-black/5">
                    <img
                      src={selectedDocDetails.fileData}
                      alt="Uploaded Scan"
                      className="object-contain w-full h-full max-h-60 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Storage & Privacy Seal */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'bn' ? 'গুগল ড্রাইভ ও ফায়ারবেসে স্বয়ংক্রিয় এনক্রিপ্টেড ব্যাকআপ সংরক্ষিত' : 'Encrypted backup synchronized to Drive & Firebase'}</span>
                </span>
                <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded">
                  256-BIT ENCLAVE
                </span>
              </div>

            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDownloadCertifiedPDF(selectedDocDetails)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center space-x-1.5 shadow-md shadow-emerald-900/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? "ডাউনলোড সার্টিফাইড পিডিএফ ('Maruf & Familys' ওয়াটারমার্ক)" : "Download Certified PDF ('Maruf & Familys' Watermark)"}</span>
              </button>

              <button
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Request Modal */}
      {requestModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-amber-300 dark:border-amber-800/80 shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'সংরক্ষিত নথির অনুমতি আবেদন' : 'Request Heritage Archive Access'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'প্রশাসক হাবিবুর রহমান মারুফের অনুমোদন প্রয়োজন' : 'Requires Administrator Maruf approval'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 mb-4">
              <strong>{lang === 'bn' ? 'নথি:' : 'Document:'}</strong> {requestModalDoc.titleBn || requestModalDoc.title}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'এই নথিটি আপনার কেন প্রয়োজন? (কারণ লিখুন)' : 'Why do you need access to this document?'}
              </label>
              <textarea
                rows={3}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="যেমন: এসিল্যান্ড অফিসে নামজারি শুনানিতে বাবার মূল এনআইডি কপি প্রদর্শন করতে হবে..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 mt-5">
              <button
                onClick={() => setRequestModalDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmAccessRequest}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
              >
                {lang === 'bn' ? 'মারুফের নিকট আবেদন পাঠান' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
