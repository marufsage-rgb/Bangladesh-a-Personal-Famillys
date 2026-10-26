/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyMember, VaultDocument, AccessRequest, BackupDestination, LockerEntry } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'maruf_family_current_user_v2',
  MEMBERS: 'maruf_family_members_v2',
  DOCUMENTS: 'maruf_family_docs_v2',
  REQUESTS: 'maruf_family_requests_v2',
  THEME: 'maruf_family_theme_v2',
  LANG: 'maruf_family_lang_v2',
  AI_CONFIG: 'maruf_family_ai_config_v2',
  LOCKER_ENTRIES: 'maruf_family_locker_entries_v2'
};

export const INITIAL_ADMIN: FamilyMember = {
  id: 'member_maruf_01',
  name: 'Habibur Rahman Maruf',
  nameBn: 'হাবিবুর রহমান মারুফ',
  email: 'habiburmaruf@gmail.com',
  relationship: 'Self / Family Head & Administrator',
  relationshipBn: 'নিজ / পরিবার প্রধান ও প্রধান প্রশাসক',
  role: 'admin',
  pin: '7860',
  phone: '+880 1711-000000',
  status: 'approved',
  joinedAt: Date.now() - 31536000000,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
  showcaseHeadline: 'ডিজিটাল পারিবারিক দুর্গ ও এআই গবেষণা ল্যাব',
  showcaseBio: 'মরহুম বাবা আব্দুল বারিক ভূঁইয়ার আদর্শ ও পারিবারিক ঐতিহ্য রক্ষায় নিবেদিত ডিজিটাল ভল্ট ও এআই সহায়ক প্লাটফর্ম। পরিবার প্রধান: মো: হাবিবুর রহমান মারুফ।',
  showcaseFont: 'serif',
  requestedAccessDocs: []
};

export const INITIAL_MEMBERS: FamilyMember[] = [
  INITIAL_ADMIN,
  {
    id: 'member_father_heritage',
    name: 'Late Abdul Barek Bhuyan',
    nameBn: 'মরহুম বাবা আব্দুল বারিক ভূঁইয়া',
    email: 'heritage.abdulbarek@maruf-family.internal',
    relationship: 'Honored Father & Family Patriarch (Late)',
    relationshipBn: 'শ্রদ্ধেয় পিতা ও পারিবারিক অভিভাবক (মরহুম)',
    role: 'member',
    pin: '0000',
    status: 'approved',
    joinedAt: Date.now() - 63072000000,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'member_mother_01',
    name: 'Begum Rokeya Bhuyan',
    nameBn: 'বেগম রোকেয়া ভূঁইয়া',
    email: 'rokeya.bhuyan@maruf-family.internal',
    relationship: 'Mother',
    relationshipBn: 'মাতা',
    role: 'co_admin',
    pin: '1234',
    phone: '+880 1819-112233',
    status: 'approved',
    joinedAt: Date.now() - 30000000000,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'member_brother_01',
    name: 'Tariqul Islam Bhuyan',
    nameBn: 'তারিকুল ইসলাম ভূঁইয়া',
    email: 'tariqul.bhuyan@maruf-family.internal',
    relationship: 'Brother',
    relationshipBn: 'ভাই',
    role: 'member',
    pin: '4321',
    phone: '+880 1912-334455',
    status: 'approved',
    joinedAt: Date.now() - 25000000000,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'member_sister_01',
    name: 'Nasrin Sultana Bhuyan',
    nameBn: 'নাসরিন সুলতানা ভূঁইয়া',
    email: 'nasrin.sultana@maruf-family.internal',
    relationship: 'Sister',
    relationshipBn: 'বোন',
    role: 'member',
    pin: '9876',
    status: 'approved',
    joinedAt: Date.now() - 20000000000,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'member_new_applicant',
    name: 'Kamrul Hassan (Bhuyan Relative)',
    nameBn: 'কামরুল হাসান (পারিবারিক আত্মীয়)',
    email: 'kamrul.applicant@gmail.com',
    relationship: 'Cousin / Relative',
    relationshipBn: 'চাচাতো ভাই / আত্মীয়',
    role: 'pending',
    pin: '1122',
    phone: '+880 1677-889900',
    status: 'pending',
    joinedAt: Date.now() - 86400000,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80'
  }
];

export const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc_father_nid',
    title: 'Late Abdul Barek Bhuyan - Official Smart NID Card',
    titleBn: 'মরহুম বাবা আব্দুল বারিক ভূঁইয়ার স্মার্ট জাতীয় পরিচয়পত্র (NID)',
    ownerEmail: 'heritage.abdulbarek@maruf-family.internal',
    ownerName: 'Late Abdul Barek Bhuyan (বাবা)',
    category: 'father_heritage',
    docType: 'National ID (NID)',
    docNumber: 'NID-19482618902847',
    issueDate: '2016-04-12',
    expiryDate: 'Lifetime / Heritage Record',
    fileName: 'Late_Abdul_Barek_Bhuyan_Smart_NID.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    isPinned: true,
    isHidden: false,
    securityLevel: 'restricted_heritage',
    tags: ['বাবা', 'NID', 'স্মার্ট কার্ড', 'উত্তরাধিকার', 'National Identity'],
    createdAt: Date.now() - 100000000,
    legalDetails: {
      holderName: 'মরহুম আব্দুল বারিক ভূঁইয়া (Late Abdul Barek Bhuyan)',
      nidNo: '19482618902847',
      fatherName: 'মরহুম হাজি মৌলভী মকবুল হোসেন ভূঁইয়া',
      motherName: 'মরহুমা ফাতেমা বেগম',
      birthDate: '1948-02-15'
    },
    aiAnalysis: {
      summaryBn: 'পিতার জাতীয় পরিচয়পত্রটি মূল সরকারি ডাটাবেজের সাথে সামঞ্জস্যপূর্ণ। উত্তরাধিকার ফরায়েজ সনদপত্র ও নামজারির আবেদনে পিতার এই এনআইডি নম্বরটি হুবহু ব্যবহার করতে হবে।',
      summaryEn: 'Father\'s official NID card verified. Crucial primary identity credential required for all estate probate, inheritance settlement, and title deed updates.',
      verifiedStatus: 'verified',
      checkpoints: [
        '১৭ ডিজিট / ১০ ডিজিট স্মার্ট কার্ড নম্বর সঠিক',
        'পারিবারিক ওয়ারিশান সনদের সাথে পিতার নামের বানান অবিকল মিলেছে',
        'জমির দলিল ১৯৮২ এর দাতা/গ্রহীতার পরিচয়ের সাথে সংগতিপূর্ণ'
      ],
      suggestedRoadmap: 'নামজারি বা ব্যাংক হিসাব উত্তরাধিকার দাবিতে এই ডকুমেন্টের সত্যায়িত রঙিন প্রিন্ট ও কিউআর যাচাই কপি সাথে রাখুন।'
    }
  },
  {
    id: 'doc_father_death_cert',
    title: 'Late Abdul Barek Bhuyan - Official Death Certificate',
    titleBn: 'মরহুম পিতা আব্দুল বারিক ভূঁইয়ার মৃত্যু নিবন্ধন সনদপত্র',
    ownerEmail: 'heritage.abdulbarek@maruf-family.internal',
    ownerName: 'Late Abdul Barek Bhuyan (বাবা)',
    category: 'father_heritage',
    docType: 'Death Certificate (মৃত্যু সনদ)',
    docNumber: 'BD-DEATH-2022-881920',
    issueDate: '2022-08-20',
    fileName: 'Late_Father_Death_Certificate_Verified.pdf',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    isPinned: true,
    isHidden: false,
    securityLevel: 'restricted_heritage',
    tags: ['মৃত্যু সনদ', 'সিটি কর্পোরেশন', 'বাবা', 'উত্তরাধিকার'],
    createdAt: Date.now() - 85000000,
    legalDetails: {
      holderName: 'আব্দুল বারিক ভূঁইয়া (Abdul Barek Bhuyan)',
      birthDate: '1948-02-15'
    },
    aiAnalysis: {
      summaryBn: 'জন্ম ও মৃত্যু নিবন্ধন রেজিস্ট্রার জেনারেলের কার্যালয় থেকে অনলাইন ভেরিফাইড মৃত্যু সনদ। কিউআর কোড স্ক্যান করে অনলাইন ডাটাবেজে রেকর্ড নিশ্চিত পাওয়া গেছে।',
      summaryEn: 'Official government online death registration certificate with authenticated QR code verification.',
      verifiedStatus: 'verified',
      checkpoints: [
        'অনলাইন রেজিস্ট্রি বইয়ে মৃত্যু ভলিউম অন্তর্ভুক্ত',
        'উত্তরাধিকার সনদ (ওয়ারিশান সার্টিফিকেট) ইস্যু করার মূল বৈধ শর্ত পূরণ করেছে'
      ]
    }
  },
  {
    id: 'doc_land_dolil_ancestral',
    title: 'Ancestral Homestead Land Registered Sale Deed (পৈতৃক সাব-কবলা দলিল)',
    titleBn: 'পৈতৃক বসতভিটা ও বাগান মূল রেজিস্ট্রিকৃত সাব-কবলা দলিল নং ৪২৮১/১৯৮২',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Late Abdul Barek Bhuyan & Maruf Family',
    category: 'land_property',
    docType: 'Registered Sale Deed (সাব-কবলা দলিল)',
    docNumber: 'DEED-4281/1982',
    issueDate: '1982-11-14',
    fileName: 'Ancestral_Land_Deed_4281_1982.pdf',
    fileType: 'document',
    fileSize: '8.7 MB',
    isPinned: true,
    isHidden: false,
    securityLevel: 'restricted_heritage',
    tags: ['জমির দলিল', 'সাব-কবলা', 'পৈতৃক ভিটা', 'খতিয়ান', 'মৌজা ভবানীপুর'],
    createdAt: Date.now() - 70000000,
    legalDetails: {
      mouza: 'ভবানীপুর (Bhabanipur)',
      jlNo: '৪২ (JL 42)',
      dagNo: '১৮২, ১৮৫ (Dag Nos. 182, 185)',
      khatianNo: 'সিএস-১৪, এসএ-৮৬, আরএস খতিয়ান ৯২',
      subRegistryOffice: 'সদর সাব-রেজিস্ট্রি কার্যালয়',
      landAreaDecimal: '১৮.৫০ শতাংশ (18.50 Decimals)',
      holderName: 'আব্দুল বারিক ভূঁইয়া (Abdul Barek Bhuyan)'
    },
    aiAnalysis: {
      summaryBn: '১৯৮২ সালের সাব-কবলা দলিলটি সম্পূর্ণ নিষ্কণ্টক। বায়া দলিল ও আরএস রেকর্ডের সাথে দাগ নম্বরের সামঞ্জস্য রয়েছে।',
      summaryEn: 'Ancestral registered sale deed from 1982 in perfect legal standing. Chain of title verified with RS survey records.',
      verifiedStatus: 'verified',
      checkpoints: [
        'সাব-রেজিস্ট্রি কার্যালয়ের ভলিউম বালাম বইতে রেকর্ড বিদ্যমান',
        'দাগ নং ১৮২ ও ১৮৫ এর উত্তর-দক্ষিণ চৌহদ্দি সুস্পষ্ট',
        'কোনো ব্যাংক দায় বা মর্টগেজ দায়বদ্ধতা নেই'
      ],
      suggestedRoadmap: 'অনলাইনে হালনাগাদ আরএস খতিয়ানের সাথে মিলিয়ে ওয়ারিশদের নামে যৌথ নামজারি (ই-মিউটেশন) অবিলম্বে সম্পন্ন রাখা বাঞ্ছনীয়।'
    }
  },
  {
    id: 'doc_land_mutation_khatian',
    title: 'Official Mutation Khatian & DCR (নামজারি খতিয়ান ও ডিসিআর পর্চা)',
    titleBn: 'সহকারী কমিশনার (ভূমি) অফিস নামজারি ও খারিজ খতিয়ান নং ৯৮২/২০২১',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf & Co-sharers',
    category: 'land_property',
    docType: 'Mutation Khatian (নামজারি খতিয়ান)',
    docNumber: 'MUTATION-ACLAND-982/2021',
    issueDate: '2021-03-10',
    fileName: 'Official_Mutation_Porcha_DCR.pdf',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    isPinned: true,
    isHidden: false,
    securityLevel: 'public_family',
    tags: ['নামজারি', 'খারিজ', 'এসিল্যান্ড', 'ই-পর্চা', 'ডিসিআর'],
    createdAt: Date.now() - 60000000,
    legalDetails: {
      mouza: 'ভবানীপুর',
      jlNo: '৪২',
      dagNo: '১৮২',
      khatianNo: 'নামজারি খতিয়ান নং ১৩৭/১',
      subRegistryOffice: 'উপজেলা ভূমি অফিস',
      landAreaDecimal: '১০.০০ শতাংশ'
    },
    aiAnalysis: {
      summaryBn: 'অনলাইন ই-নামজারি কিউআর কোডসহ অনুমোদিত। ইউনিয়ন ভূমি অফিস (তহশিল) রেজিস্টার-২ এ জোত নম্বর হালনাগাদ আছে।',
      summaryEn: 'E-mutation title approved with digital signature and land revenue ledger entry.',
      verifiedStatus: 'verified',
      checkpoints: [
        '১,১৭০ টাকা সরকারি ফি পরিশোধের ডিসিআর রসিদ সংযুক্ত',
        'অনলাইন land.gov.bd পোর্টালে খতিয়ানটি লাইভ দেখতে পাওয়া যায়'
      ]
    }
  },
  {
    id: 'doc_land_ld_tax_receipt',
    title: 'Up-to-Date Land Development Tax Receipt (ভূমি উন্নয়ন কর দাখিলা ২০২৩-২৪)',
    titleBn: 'অনলাইন ভূমি উন্নয়ন কর (খাজনা) পরিশোধের ই-দাখিলা ২০২৩-২০২৪',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Maruf Family Holdings',
    category: 'land_property',
    docType: 'Land Tax Receipt (খাজনার দাখিলা)',
    docNumber: 'LDTAX-2024-998811',
    issueDate: '2024-02-15',
    expiryDate: '2025-06-30',
    fileName: 'LD_Tax_Chalan_Dakhila_2024.pdf',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    isPinned: false,
    isHidden: false,
    securityLevel: 'public_family',
    tags: ['খাজনা', 'দাখিলা', 'LD Tax', '২০২৪', 'ভূমি মন্ত্রণালয়'],
    createdAt: Date.now() - 40000000,
    aiAnalysis: {
      summaryBn: '১৪৩০-১৪৩১ বঙ্গাব্দের ভূমি উন্নয়ন কর সম্পূর্ণ পরিশোধিত। কোনো বকেয়া নেই।',
      summaryEn: 'Land revenue taxes fully paid through ldtax.gov.bd with zero arrears.',
      verifiedStatus: 'verified',
      checkpoints: ['ইলেকট্রনিক দাখিলা বৈধ', 'আগামী অর্থবছর পর্যন্ত কর হালনাগাদ']
    }
  },
  {
    id: 'doc_maruf_passport_nid',
    title: 'Habibur Rahman Maruf - e-Passport & Smart NID Card',
    titleBn: 'হাবিবুর রহমান মারুফ - ই-পাসপোর্ট ও স্মার্ট জাতীয় পরিচয়পত্র',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf',
    category: 'personal_id',
    docType: 'e-Passport & NID',
    docNumber: 'E-PASSPORT: A04928172 / NID: 8291029381',
    issueDate: '2023-05-18',
    expiryDate: '2033-05-17',
    fileName: 'Maruf_E_Passport_Smart_NID_Bundle.pdf',
    fileType: 'pdf',
    fileSize: '4.5 MB',
    isPinned: true,
    isHidden: false,
    securityLevel: 'private_owner',
    tags: ['মারুফ', 'ই-পাসপোর্ট', 'স্মার্ট এনআইডি', '১০ বছর মেয়াদ', 'ভিসা'],
    createdAt: Date.now() - 30000000,
    legalDetails: {
      holderName: 'হাবিবুর রহমান মারুফ (Habibur Rahman Maruf)',
      nidNo: '8291029381',
      fatherName: 'Late Abdul Barek Bhuyan',
      motherName: 'Begum Rokeya Bhuyan',
      birthDate: '1992-10-14'
    },
    aiAnalysis: {
      summaryBn: '১০ বছর মেয়াদী ৪৮ পৃষ্ঠার বায়োমেট্রিক ই-পাসপোর্ট। পিতার নাম ও মাতার নাম পিতা মরহুম আব্দুল বারিক ভূঁইয়ার রেকর্ডের সাথে হুবহু সামঞ্জস্যপূর্ণ।',
      summaryEn: '10-year biometric e-passport and smart national identity card with verified biometric chip records.',
      verifiedStatus: 'verified',
      checkpoints: [
        'মেয়াদ ২০৩৩ সাল পর্যন্ত বৈধ',
        'পুলিশ ভেরিফিকেশন এসবি রিপোর্ট ক্লিয়ারেন্স রেকর্ডভুক্ত',
        'আন্তর্জাতিক ভ্রমণ ও ভিসার জন্য প্রস্তুত'
      ]
    }
  },
  {
    id: 'doc_warishan_certificate',
    title: 'Official Warishan Certificate (পারিবারিক ওয়ারিশান সনদপত্র)',
    titleBn: 'সিটি কর্পোরেশন কর্তৃক ইস্যুকৃত মূল ওয়ারিশান সনদ (উত্তরাধিকার)',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Maruf Family Co-sharers',
    category: 'father_heritage',
    docType: 'Warishan Certificate (ওয়ারিশান সনদ)',
    docNumber: 'WARISH-CC-2022-7711',
    issueDate: '2022-09-05',
    fileName: 'Family_Official_Warishan_Sanad_2022.pdf',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    isPinned: true,
    isHidden: false,
    securityLevel: 'restricted_heritage',
    tags: ['ওয়ারিশান সনদ', 'উত্তরাধিকার', 'কাউন্সিলর সনদ', 'ফরায়েজ'],
    createdAt: Date.now() - 20000000,
    legalDetails: {
      holderName: 'ওয়ারিশগণ: স্ত্রী বেগম রোকেয়া, পুত্র মারুফ, পুত্র তারিকুল, কন্যা নাসরিন',
      fatherName: 'মরহুম আব্দুল বারিক ভূঁইয়া'
    },
    aiAnalysis: {
      summaryBn: 'ওয়ারিশান সনদে মরহুমের স্ত্রী, দুই পুত্র ও এক কন্যার নাম স্পষ্টভাবে লিপিবদ্ধ। কোনো ওয়ারিশ বাদ পড়ার সুযোগ নেই। এটি সব ব্যাংক ও জমি খারিজের মূল ডকুমেন্ট।',
      summaryEn: 'Certified legal heirship certificate specifying all surviving heirs according to Bangladesh Muslim Personal Law.',
      verifiedStatus: 'verified',
      checkpoints: [
        'মেয়র ও স্থানীয় কাউন্সিলরের ডিজিটাল সিল ও স্বাক্ষরযুক্ত',
        'সকল ওয়ারিশের জাতীয় পরিচয়পত্রের সাথে নামের বানান ও বয়স মিলেছে'
      ]
    }
  },
  {
    id: 'doc_bank_finance_statement',
    title: 'Family Banking, Fixed Deposit & Sanchayapatra Records',
    titleBn: 'পারিবারিক ব্যাংক হিসাব, সঞ্চয়পত্র ও এফডিআর নিরাপত্তা দলিল',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf & Family',
    category: 'bank_finance',
    docType: 'Banking & FDR Records',
    docNumber: 'BANK-FDR-9920194',
    issueDate: '2024-01-10',
    fileName: 'Family_Bank_FDR_Sanchayapatra_2024.pdf',
    fileType: 'pdf',
    fileSize: '1.9 MB',
    isPinned: false,
    isHidden: true,
    securityLevel: 'private_owner',
    tags: ['ব্যাংক', 'এফডিআর', 'সঞ্চয়পত্র', 'টিন সার্টিফিকেট'],
    createdAt: Date.now() - 10000000,
    aiAnalysis: {
      summaryBn: 'ই-টিন (e-TIN) ও ব্যাংক নমিনি হিসেবে পরিবারের সদস্যদের নাম হালনাগাদ সংরক্ষিত।',
      summaryEn: 'Family bank accounts and national savings certificates with verified nomination records.',
      verifiedStatus: 'valid',
      checkpoints: ['ই-টিন সনদ হালনাগাদ', 'নমিনির এনআইডি সংযুক্ত']
    }
  }
];

export const INITIAL_BACKUP_DESTINATIONS: BackupDestination[] = [
  {
    id: 'dest_gdrive',
    name: 'Google Drive Enterprise Vault',
    nameBn: 'গুগল ড্রাইভ ক্লাউড ভল্ট',
    provider: 'Google Drive',
    icon: 'Cloud',
    status: 'synced',
    lastSync: 'আজ সকাল ১০:৪৫ মি (স্বয়ংক্রিয় সিঙ্ক)',
    account: 'habiburmaruf@gmail.com (Protected Drive)',
    encryption: 'AES-256 Bit Client-Side Encrypted',
    descriptionBn: 'সকল পারিবারিক নথি, বাবার এনআইডি ও জমির মূল দলিলের উচ্চ রেজুলুশন এনক্রিপ্টেড ব্যাকআপ সংরক্ষিত।'
  },
  {
    id: 'dest_github',
    name: 'GitHub Secure Private Mirror',
    nameBn: 'গিটহাব প্রাইভেট রিপোজিটরি মিরর',
    provider: 'GitHub',
    icon: 'Folder',
    status: 'synced',
    lastSync: 'আজ সকাল ০৯:১৫ মি',
    account: 'github.com/maruf-family-vault (Private Repo)',
    encryption: 'GPG Signed & Commit Verification',
    descriptionBn: 'ওয়েব অ্যাপ্লিকেশন কোডবেস ও ভল্ট মেটাডাটার অডিট লগ ভার্সন কন্ট্রোলে সুরক্ষিত।'
  },
  {
    id: 'dest_firebase',
    name: 'Firebase Encrypted Datastore & Auth',
    nameBn: 'ফায়ারবেস সিকিউর ডাটাবেজ ও সদস্য অথেন্টিকেশন',
    provider: 'Firebase',
    icon: 'Database',
    status: 'active',
    lastSync: 'রিয়েলটাইম লিসেনার সক্রিয়',
    account: 'maruf-family-vault.firebaseapp.com',
    encryption: 'Firestore Security Rules & SSL/TLS',
    descriptionBn: 'পরিবারের সদস্যদের লগইন ভেরিফিকেশন ও পাসওয়ার্ড/পিন সিকিউরিটি ম্যানেজমেন্ট।'
  },
  {
    id: 'dest_vercel',
    name: 'Vercel Edge Global Hosting',
    nameBn: 'ভার্সেল গ্লোবাল এজ হোস্টিং নেটওয়ার্ক',
    provider: 'Vercel',
    icon: 'Server',
    status: 'active',
    lastSync: 'স্ট্যাটাস: লাইভ ও নিরাপদ (99.99% আপটাইম)',
    account: 'marufer-poribaar.vercel.app',
    encryption: 'Enterprise DDoS Shield & HTTPS',
    descriptionBn: 'পরিবারের যেকোনো সদস্য যাতে দেশ বা বিদেশ থেকে যেকোনো মুহূর্তে নিরাপদে ব্রাউজ করতে পারেন।'
  },
  {
    id: 'dest_aistudio',
    name: 'AI Studio Safe Local Enclave',
    nameBn: 'এআই স্টুডিও লোকাল সিকিউর এনক্লেভ',
    provider: 'AI Studio Vault',
    icon: 'Shield',
    status: 'secured',
    lastSync: 'সার্ভার সেশন সুরক্ষিত',
    account: 'Internal Sandboxed Storage',
    encryption: 'Zero-Knowledge Offline Vault',
    descriptionBn: 'কোনো তৃতীয় পক্ষের কাছে তথ্য ফাঁস না হওয়ার শতভাগ নিশ্চয়তা।'
  }
];

export const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 'req_01',
    docId: 'doc_father_nid',
    docTitle: 'মরহুম বাবা আব্দুল বারিক ভূঁইয়ার স্মার্ট জাতীয় পরিচয়পত্র (NID)',
    requesterEmail: 'tariqul.bhuyan@maruf-family.internal',
    requesterName: 'Tariqul Islam Bhuyan (ভাই)',
    requestedAt: Date.now() - 3600000 * 5,
    reason: 'ইউনিয়ন ভূমি অফিসে বাবার নামের জমি খারিজের শুনানিতে বাবার মূল এনআইডি কপি প্রদর্শনের জন্য প্রয়োজন।',
    status: 'approved'
  },
  {
    id: 'req_02',
    docId: 'doc_land_dolil_ancestral',
    docTitle: 'পৈতৃক বসতভিটা ও বাগান মূল রেজিস্ট্রিকৃত সাব-কবলা দলিল নং ৪২৮১/১৯৮২',
    requesterEmail: 'kamrul.applicant@gmail.com',
    requesterName: 'Kamrul Hassan (পারিবারিক আত্মীয়)',
    requestedAt: Date.now() - 3600000 * 2,
    reason: 'সিএস ও আরএস দাগ নম্বর মিলিয়ে দেখার জন্য দলিলের অনুমতি চাচ্ছি।',
    status: 'pending'
  }
];

export class FamilyVaultService {
  static getCurrentUser(): FamilyMember {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading current user', e);
    }
    return INITIAL_ADMIN;
  }

  static setCurrentUser(user: FamilyMember) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static getMembers(): FamilyMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading members', e);
    }
    return INITIAL_MEMBERS;
  }

  static saveMembers(members: FamilyMember[]) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }

  static getDocuments(): VaultDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading documents', e);
    }
    return INITIAL_DOCUMENTS;
  }

  static saveDocuments(docs: VaultDocument[]) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  }

  static getRequests(): AccessRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading requests', e);
    }
    return INITIAL_REQUESTS;
  }

  static saveRequests(requests: AccessRequest[]) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }

  static addDocument(newDoc: VaultDocument): VaultDocument[] {
    const docs = this.getDocuments();
    const updated = [newDoc, ...docs];
    this.saveDocuments(updated);
    return updated;
  }

  static togglePin(docId: string): VaultDocument[] {
    const docs = this.getDocuments().map(doc => {
      if (doc.id === docId) {
        return { ...doc, isPinned: !doc.isPinned };
      }
      return doc;
    });
    this.saveDocuments(docs);
    return docs;
  }

  static toggleHide(docId: string): VaultDocument[] {
    const docs = this.getDocuments().map(doc => {
      if (doc.id === docId) {
        return { ...doc, isHidden: !doc.isHidden };
      }
      return doc;
    });
    this.saveDocuments(docs);
    return docs;
  }

  static deleteDocument(docId: string): VaultDocument[] {
    const docs = this.getDocuments().filter(doc => doc.id !== docId);
    this.saveDocuments(docs);
    return docs;
  }

  static requestAccess(docId: string, docTitle: string, user: FamilyMember, reason: string): AccessRequest[] {
    const requests = this.getRequests();
    const newReq: AccessRequest = {
      id: `req_${Date.now()}`,
      docId,
      docTitle,
      requesterEmail: user.email,
      requesterName: user.name,
      requestedAt: Date.now(),
      reason: reason || 'পারিবারিক প্রয়োজনে অনুমতি প্রার্থনা।',
      status: 'pending'
    };
    const updated = [newReq, ...requests];
    this.saveRequests(updated);
    return updated;
  }

  static approveRequest(reqId: string): { requests: AccessRequest[], members: FamilyMember[] } {
    const requests = this.getRequests().map(r => r.id === reqId ? { ...r, status: 'approved' as const } : r);
    this.saveRequests(requests);

    const targetReq = requests.find(r => r.id === reqId);
    let members = this.getMembers();
    if (targetReq) {
      members = members.map(m => {
        if (m.email === targetReq.requesterEmail) {
          const current = m.requestedAccessDocs || [];
          if (!current.includes(targetReq.docId)) {
            return { ...m, requestedAccessDocs: [...current, targetReq.docId] };
          }
        }
        return m;
      });
      this.saveMembers(members);
    }
    return { requests, members };
  }

  static rejectRequest(reqId: string): AccessRequest[] {
    const requests = this.getRequests().map(r => r.id === reqId ? { ...r, status: 'rejected' as const } : r);
    this.saveRequests(requests);
    return requests;
  }

  static approveMember(memberId: string): FamilyMember[] {
    const members = this.getMembers().map(m => m.id === memberId ? { ...m, status: 'approved' as const, role: 'member' as const } : m);
    this.saveMembers(members);
    return members;
  }

  static removeMember(memberId: string): FamilyMember[] {
    const members = this.getMembers().filter(m => m.id !== memberId);
    this.saveMembers(members);
    return members;
  }

  static exportFullVaultJSON(): string {
    const payload = {
      app: 'Marufer Poribaar - Family Digital Vault',
      exportedAt: new Date().toISOString(),
      admin: 'Habibur Rahman Maruf (habiburmaruf@gmail.com)',
      securityHash: 'SHA256-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      members: this.getMembers(),
      documents: this.getDocuments(),
      requests: this.getRequests()
    };
    return JSON.stringify(payload, null, 2);
  }

  static importVaultJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.documents && Array.isArray(data.documents)) {
        this.saveDocuments(data.documents);
        if (data.members && Array.isArray(data.members)) {
          this.saveMembers(data.members);
        }
        if (data.requests && Array.isArray(data.requests)) {
          this.saveRequests(data.requests);
        }
        return true;
      }
    } catch (e) {
      console.error('Invalid vault JSON backup', e);
    }
    return false;
  }

  static clearAllDemoData(): VaultDocument[] {
    const blank: VaultDocument[] = [];
    this.saveDocuments(blank);
    return blank;
  }

  static resetToInitialDemo(): VaultDocument[] {
    this.saveDocuments(INITIAL_DOCUMENTS);
    return INITIAL_DOCUMENTS;
  }

  // --- Locker Entries Management (Passwords, Addresses, Photos, Notes) ---
  static getLockerEntries(): LockerEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCKER_ENTRIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading locker entries:', e);
    }
    return INITIAL_LOCKER_ENTRIES;
  }

  static saveLockerEntries(entries: LockerEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCKER_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving locker entries:', e);
    }
  }

  static addLockerEntry(entry: Omit<LockerEntry, 'id' | 'createdAt' | 'updatedAt'>): LockerEntry[] {
    const all = this.getLockerEntries();
    const newEntry: LockerEntry = {
      ...entry,
      id: `locker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newEntry, ...all];
    this.saveLockerEntries(updated);
    return updated;
  }

  static updateLockerEntry(id: string, updates: Partial<LockerEntry>): LockerEntry[] {
    const all = this.getLockerEntries();
    const updated = all.map(item => item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item);
    this.saveLockerEntries(updated);
    return updated;
  }

  static deleteLockerEntry(id: string): LockerEntry[] {
    const all = this.getLockerEntries();
    const updated = all.filter(item => item.id !== id);
    this.saveLockerEntries(updated);
    return updated;
  }

  static toggleHideLockerEntry(id: string): LockerEntry[] {
    const all = this.getLockerEntries();
    const updated = all.map(item => item.id === id ? { ...item, isHidden: !item.isHidden, updatedAt: Date.now() } : item);
    this.saveLockerEntries(updated);
    return updated;
  }

  static togglePinLockerEntry(id: string): LockerEntry[] {
    const all = this.getLockerEntries();
    const updated = all.map(item => item.id === id ? { ...item, isPinned: !item.isPinned, updatedAt: Date.now() } : item);
    this.saveLockerEntries(updated);
    return updated;
  }
}

export const INITIAL_LOCKER_ENTRIES: LockerEntry[] = [
  {
    id: 'locker_pass_01',
    type: 'password',
    title: 'E-Mutation & Land Records Portal (ই-নামজারি)',
    titleBn: 'ই-নামজারি ও ভূমি মন্ত্রণালয় পোর্টাল লগইন পাসওয়ার্ড',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf',
    securityLevel: 'admin_only',
    isPinned: true,
    isHidden: false,
    serviceName: 'Ministry of Land (land.gov.bd)',
    username: 'maruf_bhuyan_estate',
    secretPassword: 'Khat!an_#2026_Secured7860',
    portalUrl: 'https://mutation.land.gov.bd',
    tags: ['জমি', 'ভূমি মন্ত্রণালয়', 'নামজারি', 'পাসওয়ার্ড'],
    createdAt: Date.now() - 15000000,
    updatedAt: Date.now() - 15000000,
  },
  {
    id: 'locker_pass_02',
    type: 'password',
    title: 'Sonali Bank Family Trust Account NetBanking',
    titleBn: 'সোনালী ব্যাংক পারিবারিক ট্রাস্ট অ্যাকাউন্ট ও নেটব্যাংকিং',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf',
    securityLevel: 'admin_only',
    isPinned: true,
    isHidden: false,
    serviceName: 'Sonali Bank PLC (Online Banking)',
    username: 'acc_0918_barek_family',
    secretPassword: 'Sonali#Secure7860$Protected',
    portalUrl: 'https://www.sonalibank.com.bd',
    tags: ['ব্যাংক', 'সোনালী ব্যাংক', 'হিসাব', 'পিন'],
    createdAt: Date.now() - 14000000,
    updatedAt: Date.now() - 14000000,
  },
  {
    id: 'locker_pass_03',
    type: 'password',
    title: 'Bangladesh e-Passport Portal Credentials',
    titleBn: 'বাংলাদেশ ই-পাসপোর্ট অনলাইন অ্যাকাউন্ট পাসওয়ার্ড',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf',
    securityLevel: 'private_owner',
    isPinned: false,
    isHidden: false,
    serviceName: 'e-Passport Bangladesh (epassport.gov.bd)',
    username: 'habiburmaruf@gmail.com',
    secretPassword: 'Pass#2026!MarufBDSafe',
    portalUrl: 'https://www.epassport.gov.bd',
    tags: ['পাসপোর্ট', 'ইমিগ্রেশন', 'লগইন'],
    createdAt: Date.now() - 13000000,
    updatedAt: Date.now() - 13000000,
  },
  {
    id: 'locker_addr_01',
    type: 'address',
    title: 'Ancestral Homestead & Estate (পৈতৃক ভূঁইয়া বাড়ি)',
    titleBn: 'মরহুম আব্দুল বারিক ভূঁইয়ার পৈতৃক ভিটা ও জমিদারী বাড়ি',
    ownerEmail: 'heritage.abdulbarek@maruf-family.internal',
    ownerName: 'Late Abdul Barek Bhuyan',
    securityLevel: 'public_family',
    isPinned: true,
    isHidden: false,
    addressType: 'ancestral_homestead',
    addressLine: 'ভূঁইয়া বাড়ি, মৌজা: রামনগর (জেএল নং ৯৪), দাগ নং ১৮২',
    thana: 'সোনারগাঁও (Sonargaon)',
    district: 'নারায়ণগঞ্জ (Narayanganj)',
    phone: '+880 1711-000000',
    mapCoordinates: '23.6521° N, 90.6019° E',
    tags: ['পৈতৃক ভিটা', 'সোনারগাঁও', 'মৌজা রামনগর', 'দাগ ১৮২'],
    createdAt: Date.now() - 12000000,
    updatedAt: Date.now() - 12000000,
  },
  {
    id: 'locker_addr_02',
    type: 'address',
    title: 'Dhaka Family Residence & Head Office',
    titleBn: 'ঢাকা পারিবারিক বাসভবন ও প্রধান কার্যালয়',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf',
    securityLevel: 'public_family',
    isPinned: true,
    isHidden: false,
    addressType: 'residence',
    addressLine: 'বাড়ি # ১৪, রোড # ০৭, সেক্টর # ০৪, উত্তরা মডেল টাউন',
    thana: 'উত্তরা পূর্ব (Uttara)',
    district: 'ঢাকা (Dhaka - 1230)',
    phone: '+880 1711-000000',
    mapCoordinates: '23.8728° N, 90.3984° E',
    tags: ['ঢাকা', 'উত্তরা', 'বাসভবন', 'মারুফ'],
    createdAt: Date.now() - 11000000,
    updatedAt: Date.now() - 11000000,
  },
  {
    id: 'locker_img_01',
    type: 'image',
    title: 'Late Abdul Barek Bhuyan - Heritage Archive Portrait',
    titleBn: 'শ্রদ্ধেয় পিতা মরহুম আব্দুল বারিক ভূঁইয়ার স্মৃতি আর্কাইভ আলোকচিত্র',
    ownerEmail: 'heritage.abdulbarek@maruf-family.internal',
    ownerName: 'Late Abdul Barek Bhuyan',
    securityLevel: 'public_family',
    isPinned: true,
    isHidden: false,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    caption: 'মরহুম পিতা আব্দুল বারিক ভূঁইয়ার আশীর্বাদ ও আদর্শ আমাদের পরিবারের শক্তি।',
    tags: ['বাবা', 'স্মৃতি', 'পোর্ট্রেট', 'পরিবার'],
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now() - 10000000,
  },
  {
    id: 'locker_note_01',
    type: 'note',
    title: 'Important Estate Instructions & Safe Locker Reference',
    titleBn: 'পারিবারিক সম্পত্তির জরুরি দিকনির্দেশনা ও ব্যাংক সেফ লকার',
    ownerEmail: 'habiburmaruf@gmail.com',
    ownerName: 'Habibur Rahman Maruf',
    securityLevel: 'restricted_heritage',
    isPinned: true,
    isHidden: false,
    noteContent: 'পৈতৃক ভিটার মূল সাব-কবলা দলিল (১৯৮২) ও সিএস/এসএ খতিয়ানের মূল কপি সোনালী ব্যাংক সোনারগাঁও শাখার লকার নং ৭৪-এ সংরক্ষিত। জরুরি পরিস্থিতিতে মারুফ ও মাতা বেগম রোকেয়া যৌথ স্বাক্ষরে পরিচালনা করবেন।',
    tags: ['লকার নির্দেশিকা', 'ব্যাংক ভল্ট', 'দলিল হেফাজত'],
    createdAt: Date.now() - 9000000,
    updatedAt: Date.now() - 9000000,
  }
];
