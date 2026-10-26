/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Save, 
  HardDrive, 
  Shield, 
  Sparkles,
  Phone,
  Mail,
  Key
} from 'lucide-react';
import { FamilyMember, AppLanguage } from '../types';
import { parseGoogleDriveUrl } from '../services/googleDriveHelper';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSave: (updated: FamilyMember) => void;
  lang: AppLanguage;
  isAdminViewing?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  lang,
  isAdminViewing = false,
}) => {
  const [name, setName] = useState(member.name);
  const [nameBn, setNameBn] = useState(member.nameBn || member.name);
  const [relationship, setRelationship] = useState(member.relationship);
  const [relationshipBn, setRelationshipBn] = useState(member.relationshipBn || member.relationship);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone || '');
  const [pin, setPin] = useState(member.pin || '1234');
  const [avatar, setAvatar] = useState(member.avatar || '');
  const [googleDriveAvatarUrl, setGoogleDriveAvatarUrl] = useState('');
  const [driveParsedSuccess, setDriveParsedSuccess] = useState(false);

  // Showcase Background & Presentation state
  const [coverImage, setCoverImage] = useState(member.coverImage || '');
  const [showcaseHeadline, setShowcaseHeadline] = useState(member.showcaseHeadline || '');
  const [showcaseBio, setShowcaseBio] = useState(member.showcaseBio || '');
  const [showcaseFont, setShowcaseFont] = useState<'display' | 'serif' | 'modern'>(member.showcaseFont || 'serif');

  if (!isOpen) return null;

  // Handle local picture upload
  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      setGoogleDriveAvatarUrl('');
      setDriveParsedSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle cover image upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCoverImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle Google Drive picture URL
  const handleDriveUrlChange = (val: string) => {
    setGoogleDriveAvatarUrl(val);
    const parsed = parseGoogleDriveUrl(val);
    if (parsed.directImageUrl) {
      setAvatar(parsed.directImageUrl);
      setDriveParsedSuccess(parsed.isValidDriveUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: FamilyMember = {
      ...member,
      name: name.trim(),
      nameBn: nameBn.trim() || name.trim(),
      relationship: relationship.trim(),
      relationshipBn: relationshipBn.trim() || relationship.trim(),
      email: email.trim(),
      phone: phone.trim(),
      pin: pin.trim(),
      avatar: avatar.trim(),
      coverImage: coverImage.trim(),
      showcaseHeadline: showcaseHeadline.trim(),
      showcaseBio: showcaseBio.trim(),
      showcaseFont: showcaseFont,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সদস্য প্রোফাইল ও ছবি এডিট করুন' : 'Edit Member Profile & Picture'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'ব্যক্তিগত তথ্য, ছবি বা গুগল ড্রাইভ ইমেজ লিংক আপডেট করুন' : 'Update profile photo, Google Drive images & identity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Avatar Picture Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              {lang === 'bn' ? 'প্রোফাইল ছবি (Picture / Avatar):' : 'Profile Picture:'}
            </label>

            <div className="flex items-center space-x-4">
              {/* Picture Thumbnail Preview */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-emerald-600 border-2 border-emerald-500 shadow-md shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                    {name ? name[0] : 'M'}
                  </div>
                )}
                {driveParsedSuccess && (
                  <div className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[8px] font-bold text-center py-0.5">
                    DRIVE
                  </div>
                )}
              </div>

              {/* Upload or Drive Options */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      className="hidden"
                    />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatar('');
                        setGoogleDriveAvatarUrl('');
                        setDriveParsedSuccess(false);
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-600 underline"
                    >
                      {lang === 'bn' ? 'রিমুভ' : 'Remove'}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <HardDrive className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={googleDriveAvatarUrl}
                    onChange={(e) => handleDriveUrlChange(e.target.value)}
                    placeholder="অথবা Google Drive ছবির লিংক বা ফাইল আইডি পেস্ট করুন..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">
                {lang === 'bn' ? 'বা ডিফল্ট প্রিসেট থেকে নির্বাচন করুন:' : 'Or pick from family presets:'}
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_AVATARS.map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(pUrl);
                      setGoogleDriveAvatarUrl('');
                      setDriveParsedSuccess(false);
                    }}
                    className={`w-8 h-8 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      avatar === pUrl ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={pUrl} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'নাম (English)' : 'Full Name (English)'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Habibur Rahman Maruf"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'নাম (বাংলা)' : 'Full Name (Bangla)'}
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="হাবিবুর রহমান মারুফ"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bangla"
              />
            </div>
          </div>

          {/* Relationship & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'সম্পর্ক (বাংলা)' : 'Relationship (Bangla)'}
              </label>
              <input
                type="text"
                value={relationshipBn}
                onChange={(e) => {
                  setRelationshipBn(e.target.value);
                  if (!relationship) setRelationship(e.target.value);
                }}
                placeholder="পিতা / মাতা / ভাই / বোন / নিজ"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bangla"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ফোন নম্বর (Phone)' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711-000000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Showcase Cover Photo & Presentation Settings */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                {lang === 'bn' ? 'শোকেস ব্যাকগ্রাউন্ড ফটো ও ফন্ট শৈলী:' : 'Showcase Cover Photo & Font Style:'}
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10">
                Web Showcase
              </span>
            </div>

            {/* Cover Image Preview & Upload */}
            <div className="space-y-2">
              <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                {coverImage ? (
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    {lang === 'bn' ? 'কোনো ব্যাকগ্রাউন্ড ছবি নেই' : 'No Cover Image Set'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'কভার ছবি নির্বাচন' : 'Choose Cover'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="বা ব্যাকগ্রাউন্ড ছবির লিঙ্ক / Drive URL পেস্ট করুন..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Headline & Font selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'শোকেস হেডলাইন:' : 'Showcase Headline:'}
                </label>
                <input
                  type="text"
                  value={showcaseHeadline}
                  onChange={(e) => setShowcaseHeadline(e.target.value)}
                  placeholder="ডিজিটাল দুর্গ ও এআই ল্যাব"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'ফন্ট শৈলী (Typography):' : 'Showcase Typography:'}
                </label>
                <select
                  value={showcaseFont}
                  onChange={(e: any) => setShowcaseFont(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="serif">{lang === 'bn' ? 'সেরিফ রাজকীয় ফন্ট (Serif Heritage)' : 'Serif (Heritage)'}</option>
                  <option value="display">{lang === 'bn' ? 'ডিসপ্লে আধুনিক ল্যাব (Display Mono)' : 'Display (Modern)'}</option>
                  <option value="modern">{lang === 'bn' ? 'স্যান্স মডার্ন ক্লিন (Sans Clean)' : 'Sans (Clean)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="habiburmaruf@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ব্যক্তিগত ৪-ডিজিট পিন (PIN)' : '4-Digit PIN'}
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="7860"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-900/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রোফাইল আপডেট করুন' : 'Save Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
