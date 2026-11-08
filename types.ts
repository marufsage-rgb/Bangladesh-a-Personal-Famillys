/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppLanguage = 'bn' | 'en';
export type AppTheme = 'emerald' | 'midnight' | 'titanium' | 'amber';

export type UserRole = 'admin' | 'co_admin' | 'member' | 'pending';

export interface FamilyMember {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  relationship: string;
  relationshipBn?: string;
  role: UserRole;
  pin: string;
  phone?: string;
  status: 'approved' | 'pending' | 'suspended';
  joinedAt: number;
  avatar?: string;
  coverImage?: string;
  showcaseHeadline?: string;
  showcaseBio?: string;
  showcaseFont?: 'display' | 'serif' | 'modern';
  requestedAccessDocs?: string[];
}

export type LockerType = 'document' | 'image' | 'password' | 'address' | 'note';

export interface LockerEntry {
  id: string;
  type: LockerType;
  title: string;
  titleBn: string;
  ownerEmail: string;
  ownerName: string;
  securityLevel: SecurityLevel;
  isPinned: boolean;
  isHidden: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  
  // For Passwords & Credentials
  serviceName?: string;
  username?: string;
  secretPassword?: string;
  portalUrl?: string;
  
  // For Address & Land/Property location
  addressType?: 'ancestral_homestead' | 'residence' | 'land_location' | 'office' | 'emergency';
  addressLine?: string;
  district?: string;
  thana?: string;
  phone?: string;
  mapCoordinates?: string;
  
  // For Photos & Images
  imageUrl?: string;
  driveFileId?: string;
  caption?: string;
  
  // For Private Notes
  noteContent?: string;
  
  // Linked Vault Document ID
  vaultDocId?: string;
}

export type DocCategory = 
  | 'father_heritage' 
  | 'land_property' 
  | 'personal_id' 
  | 'bank_finance' 
  | 'education_work'
  | 'legal_contracts';

export type SecurityLevel = 
  | 'public_family'       // Visible to all approved family members
  | 'private_owner'       // Visible only to owner & Admin Maruf
  | 'restricted_heritage' // Late Baba Abdul Barek Bhuyan & ancestral papers (needs Admin approval)
  | 'admin_only';         // Only Habibur Rahman Maruf

export interface VaultDocument {
  id: string;
  title: string;
  titleBn: string;
  ownerEmail: string;
  ownerName: string;
  category: DocCategory;
  docType: string;
  docNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileData?: string; // base64 or preview asset or direct image URL
  googleDriveUrl?: string; // Google Drive image or file URL
  driveFileId?: string; // Formatted Google Drive ID
  fileType: 'image' | 'pdf' | 'document';
  fileName: string;
  fileSize?: string;
  isPinned: boolean;
  isHidden: boolean;
  securityLevel: SecurityLevel;
  tags: string[];
  createdAt: number;
  legalDetails?: {
    mouza?: string;
    jlNo?: string;
    dagNo?: string;
    khatianNo?: string;
    subRegistryOffice?: string;
    landAreaDecimal?: string;
    holderName?: string;
    nidNo?: string;
    fatherName?: string;
    motherName?: string;
    birthDate?: string;
  };
  aiAnalysis?: {
    summaryBn: string;
    summaryEn: string;
    verifiedStatus: 'verified' | 'action_needed' | 'valid';
    checkpoints: string[];
    suggestedRoadmap?: string;
  };
}

export interface AccessRequest {
  id: string;
  docId: string;
  docTitle: string;
  requesterEmail: string;
  requesterName: string;
  requestedAt: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BackupDestination {
  id: string;
  name: string;
  nameBn: string;
  provider: 'Google Drive' | 'GitHub' | 'Firebase' | 'Vercel' | 'AI Studio Vault';
  icon: string;
  status: 'active' | 'synced' | 'secured';
  lastSync: string;
  account: string;
  encryption: string;
  descriptionBn: string;
}

export interface GovtHotline {
  number: string;
  titleBn: string;
  titleEn: string;
  category: string;
  descriptionBn: string;
  descriptionEn: string;
  badge: string;
  timing: string;
  tollFree: boolean;
  portalUrl?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  category?: string;
  voiceRead?: boolean;
  referenceRules?: string[];
  suggestedSteps?: string[];
}

export interface AIProviderConfig {
  activeProvider: 'server_gemini' | 'custom_gemini' | 'groq' | 'openrouter';
  customApiKey?: string;
  customEndpoint?: string;
  model: string;
  temperature: number;
  agentTone: 'lawyer_advisor' | 'friendly_family' | 'detailed_researcher';
}

export interface NewsHeadline {
  id: string;
  title: string;
  titleBn?: string;
  summary: string;
  url?: string;
  publishedAt: string;
  source: string;
  isHighPriority: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}