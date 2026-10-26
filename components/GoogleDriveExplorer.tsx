/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLanguage, FamilyMember, VaultDocument, LockerEntry } from '../types';
import { 
  signInWithGoogle, 
  signOutGoogle, 
  getDriveAccessToken, 
  getDriveUser, 
  listGoogleDriveFiles, 
  uploadFileToGoogleDrive, 
  deleteGoogleDriveFile, 
  DriveFileItem 
} from '../services/googleDriveAuthService';
import { 
  HardDrive, 
  Upload, 
  Search, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  FolderPlus, 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Lock, 
  Check, 
  X,
  Eye
} from 'lucide-react';

interface GoogleDriveExplorerProps {
  currentUser: FamilyMember;
  lang: AppLanguage;
  onImportToVault: (doc: Partial<VaultDocument>) => void;
  onImportToLocker: (entry: Partial<LockerEntry>) => void;
  onClose?: () => void;
}

export const GoogleDriveExplorer: React.FC<GoogleDriveExplorerProps> = ({
  currentUser,
  lang,
  onImportToVault,
  onImportToLocker,
  onClose,
}) => {
  const isBn = lang === 'bn';
  const [accessToken, setAccessToken] = useState<string | null>(() => getDriveAccessToken());
  const [googleUser, setGoogleUser] = useState<any>(() => getDriveUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drive files
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents'>('all');

  // Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Destructive delete confirmation modal state (MANDATORY per Workspace Integration Skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Preview / imported state
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Load files whenever token is available
  useEffect(() => {
    if (accessToken) {
      loadFiles(accessToken);
    }
  }, [accessToken]);

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogle();
      setAccessToken(res.accessToken);
      setGoogleUser(res.user);
      setSuccessMsg(isBn ? 'গুগল ড্রাইভ সফলভাবে সংযুক্ত হয়েছে!' : 'Google Drive connected successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isBn ? 'গুগল লগইন সম্পন্ন করা যায়নি।' : 'Google Sign-In failed.'));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogle();
      setAccessToken(null);
      setGoogleUser(null);
      setDriveFiles([]);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFiles = async (token: string, query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await listGoogleDriveFiles(token, query);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isBn ? 'ড্রাইভ ফাইল তালিকাভুক্ত করা যায়নি।' : 'Failed to fetch Drive files.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFileToGoogleDrive(accessToken, file, 'Maruf Family Vault');
      setSuccessMsg(isBn ? `"${file.name}" গুগল ড্রাইভে সংরক্ষিত হয়েছে!` : `"${file.name}" uploaded to Google Drive!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      // Reload files
      await loadFiles(accessToken, searchQuery);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isBn ? 'ফাইল আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.'));
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  // MANDATORY: User confirmation before destructive operation
  const executeDelete = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteGoogleDriveFile(accessToken, fileToDelete.id);
      setSuccessMsg(isBn ? 'ড্রাইভ থেকে ফাইলটি মুছে ফেলা হয়েছে।' : 'File removed from Google Drive.');
      setDriveFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      setFileToDelete(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (isBn ? 'ফাইল ডিলিট করা যায়নি।' : 'Delete failed.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Import into Family Vault / Locker
  const handleImportToVault = (file: DriveFileItem) => {
    const isImage = file.mimeType.startsWith('image/');
    const isPdf = file.mimeType.includes('pdf');
    
    // Direct preview thumbnail from Drive
    const directImageUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`;
    const driveUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;

    onImportToVault({
      title: file.name.replace(/\.[^/.]+$/, ''),
      titleBn: file.name.replace(/\.[^/.]+$/, ''),
      category: isImage ? 'personal_id' : 'land_property',
      docType: isImage ? 'Photo / Image ID' : isPdf ? 'Legal Document (PDF)' : 'Drive File',
      fileName: file.name,
      fileSize: file.size,
      fileType: isImage ? 'image' : isPdf ? 'pdf' : 'document',
      googleDriveUrl: driveUrl,
      driveFileId: file.id,
      fileData: isImage ? directImageUrl : undefined,
      securityLevel: 'public_family',
      tags: ['Google Drive', 'মারুফের পরিবার'],
    });

    setImportedIds(prev => new Set(prev).add(file.id));
    setSuccessMsg(isBn ? `"${file.name}" পারিবারিক ভল্টে যুক্ত হয়েছে!` : `"${file.name}" added to Family Vault!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImportToLockerPhoto = (file: DriveFileItem) => {
    const directImageUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`;
    onImportToLocker({
      type: 'image',
      title: file.name,
      titleBn: file.name,
      imageUrl: directImageUrl,
      driveFileId: file.id,
      caption: isBn ? 'গুগল ড্রাইভ থেকে আমদানি করা পারিবারিক ছবি' : 'Imported family photo from Google Drive',
      securityLevel: 'public_family',
      tags: ['গুগল ড্রাইভ', 'ছবি'],
    });

    setImportedIds(prev => new Set(prev).add(file.id));
    setSuccessMsg(isBn ? `"${file.name}" পারিবারিক ছবির অ্যালবামে যোগ করা হয়েছে!` : `"${file.name}" added to Photo Locker!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Filtered files
  const filteredFiles = driveFiles.filter(f => {
    if (filterType === 'images') {
      return f.mimeType.startsWith('image/');
    }
    if (filterType === 'documents') {
      return f.mimeType.includes('pdf') || f.mimeType.includes('document') || f.mimeType.includes('sheet');
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl transition-all">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span>{isBn ? 'গুগল ড্রাইভ পারিবারিক সংযোগ' : 'Google Drive Family Integration'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Official API
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              {isBn 
                ? 'মারুফের পরিবারের ব্যক্তিগত ড্রাইভ থেকে আসল দলিল, ছবি ও নথি ভল্টে নিরাপদে সংযুক্ত করুন।' 
                : 'Directly browse, upload, and sync documents and family photos from your Google Drive.'}
            </p>
          </div>
        </div>

        {/* Right action / Status */}
        <div className="flex items-center gap-3">
          {accessToken && googleUser ? (
            <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/80">
              {googleUser.photoURL ? (
                <img src={googleUser.photoURL} alt={googleUser.displayName || 'Google User'} className="w-8 h-8 rounded-full border border-blue-400" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {(googleUser.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white">{googleUser.displayName || 'Connected User'}</div>
                <div className="text-[11px] text-slate-400">{googleUser.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors ml-1"
              >
                {isBn ? 'ডিসকানেক্ট' : 'Sign Out'}
              </button>
            </div>
          ) : (
            /* Official Google Sign-In button per workspace integration skill */
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningIn ? (isBn ? 'কানেক্ট হচ্ছে...' : 'Connecting...') : (isBn ? 'গুগল দিয়ে সাইন ইন ও ড্রাইভ লিঙ্ক' : 'Sign in with Google')}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs md:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Drive Dashboard */}
      {!accessToken ? (
        <div className="py-14 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-4 shadow-xl">
            <HardDrive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {isBn ? 'গুগল ড্রাইভ সংযোগ করুন' : 'Connect Your Google Drive'}
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto mb-6">
            {isBn 
              ? 'মারুফের পরিবারের অনুমোদিত সদস্যরা নিজেদের গুগল ড্রাইভের ছবি, পাসপোর্ট স্ক্যান ও জমির দলিল এক ক্লিকে পারিবারিক সুরক্ষিত ভল্টে যুক্ত করতে পারবেন।' 
              : 'Sign in to access your personal Google Drive files, upload directly, and seamlessly attach documents to the Maruf Family Enclave.'}
          </p>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-900/30 transition-transform active:scale-95"
          >
            <HardDrive className="w-4 h-4" />
            <span>{isSigningIn ? (isBn ? 'সংযোগ হচ্ছে...' : 'Connecting...') : (isBn ? 'গুগল ড্রাইভ সক্রিয় করুন' : 'Activate Google Drive')}</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Controls Bar: Search, Filters, and Upload */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadFiles(accessToken, searchQuery)}
                  placeholder={isBn ? 'ড্রাইভে ফাইল বা ছবি খুঁজুন...' : 'Search Drive files or photos...'}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => loadFiles(accessToken, searchQuery)}
                disabled={isLoading}
                title={isBn ? 'রিফ্রেশ' : 'Refresh'}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-800/70 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'সকল' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('images')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'images' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isBn ? 'ছবি' : 'Photos'}</span>
              </button>
              <button
                onClick={() => setFilterType('documents')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'documents' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isBn ? 'দলিল/নথি' : 'Docs'}</span>
              </button>
            </div>

            {/* Direct Upload to Google Drive */}
            <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs md:text-sm cursor-pointer shadow-lg shadow-blue-900/30 transition-all hover:scale-105 active:scale-95 flex-shrink-0">
              <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
              <span>{isUploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'ড্রাইভে আপলোড' : 'Upload to Drive')}</span>
              <input
                type="file"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Files Grid */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400 mb-3" />
              <p className="text-xs md:text-sm">{isBn ? 'গুগল ড্রাইভ থেকে ফাইল আনা হচ্ছে...' : 'Fetching Google Drive records...'}</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-800/40 border border-dashed border-slate-700/80">
              <FolderPlus className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">{isBn ? 'কোনো ফাইল খুঁজে পাওয়া যায়নি' : 'No files found in Google Drive'}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isBn ? 'উপরে "ড্রাইভে আপলোড" বোতামে ক্লিক করে নতুন ছবি বা দলিল আপলোড করুন।' : 'Click "Upload to Drive" above to add new photos or legal documents.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => {
                const isImage = file.mimeType.startsWith('image/');
                const isImported = importedIds.has(file.id);
                const thumbUrl = file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;

                return (
                  <div
                    key={file.id}
                    className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail or icon */}
                      <div className="w-full h-36 rounded-xl bg-slate-900/80 overflow-hidden relative mb-3 flex items-center justify-center border border-slate-700/60">
                        {isImage ? (
                          <img
                            src={thumbUrl}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to icon
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-800 text-blue-400">
                            <FileText className="w-10 h-10" />
                          </div>
                        )}

                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-950/80 text-slate-300 backdrop-blur-sm border border-slate-800">
                          {file.size}
                        </span>
                      </div>

                      {/* File Info */}
                      <h4 className="text-xs md:text-sm font-semibold text-white truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {file.mimeType}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {/* Open in Drive */}
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isBn ? 'গুগল ড্রাইভে দেখুন' : 'View on Drive'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Delete from Drive (triggers mandatory confirmation modal) */}
                        <button
                          onClick={() => setFileToDelete(file)}
                          title={isBn ? 'ড্রাইভ থেকে মুছুন' : 'Delete file'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Add to Family Vault or Photo Locker */}
                      <div className="flex items-center gap-1">
                        {isImage && (
                          <button
                            onClick={() => handleImportToLockerPhoto(file)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors"
                          >
                            {isBn ? 'ছবি লকার' : 'Locker'}
                          </button>
                        )}
                        <button
                          onClick={() => handleImportToVault(file)}
                          disabled={isImported}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isImported
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          }`}
                        >
                          {isImported ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{isImported ? (isBn ? 'যুক্ত হয়েছে' : 'Added') : (isBn ? 'ভল্টে আনুন' : 'Import')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MANDATORY Confirmation Dialog for Destructive Operations per Workspace Integration Skill */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-1">
              {isBn ? 'গুগল ড্রাইভ ফাইল মুছে ফেলার সতর্কতা' : 'Confirm Google Drive File Deletion'}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 text-center mb-4">
              {isBn 
                ? `আপনি কি নিশ্চিতভাবে আপনার গুগল ড্রাইভ থেকে "${fileToDelete.name}" মুছে ফেলতে চান? এটি আর পুনরুদ্ধার করা যাবে না।`
                : `Are you sure you want to permanently delete "${fileToDelete.name}" from your Google Drive? This action cannot be undone.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition-colors flex items-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, ড্রাইভ থেকে মুছুন' : 'Yes, Delete File')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
