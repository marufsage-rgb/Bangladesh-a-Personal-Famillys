/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App safely if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider with full Google Drive scopes specified in metadata
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

// In-memory token cache (never stored in localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

/**
 * Initialize Firebase Auth listener.
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token will be refreshed on explicit sign in if not in memory
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Drive OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Return current cached access token
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Return current Google user
 */
export const getDriveUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

/**
 * Sign out from Google
 */
export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

/**
 * List files from Google Drive
 */
export const listGoogleDriveFiles = async (
  token: string,
  query?: string,
  pageSize: number = 25
): Promise<DriveFileItem[]> => {
  try {
    let q = "trashed = false";
    if (query && query.trim()) {
      q += ` and (name contains '${query.replace(/'/g, "\\'")}')`;
    }

    const fields = 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, iconLink, size, createdTime, modifiedTime)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Google Drive files (${res.status})`);
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      ...f,
      size: formatFileSize(f.size),
    }));
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    throw error;
  }
};

/**
 * Upload a local File/Blob directly to user's Google Drive
 */
export const uploadFileToGoogleDrive = async (
  token: string,
  file: File,
  folderName: string = 'Maruf Family Vault'
): Promise<DriveFileItem> => {
  try {
    // 1. Get or create the family folder
    const folderId = await getOrCreateFamilyFolder(token, folderName);

    // 2. Prepare metadata
    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      parents: folderId ? [folderId] : undefined,
    };

    // 3. Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        // strip data:...;base64,
        const b64 = result.split(',')[1] || '';
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // We can use standard multipart body
    const metadataString = JSON.stringify(metadata);
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      metadataString +
      delimiter +
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webContentLink,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Google Drive upload failed (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

/**
 * Delete a file from Google Drive.
 * MANDATORY: Call this only after explicit user confirmation in UI.
 */
export const deleteGoogleDriveFile = async (
  token: string,
  fileId: string
): Promise<boolean> => {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to delete file from Google Drive (${res.status})`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting Google Drive file:', error);
    throw error;
  }
};

/**
 * Helper to get or create folder in Google Drive
 */
async function getOrCreateFamilyFolder(token: string, folderName: string): Promise<string | null> {
  try {
    const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    const createData = await createRes.json();
    return createData.id || null;
  } catch (e) {
    console.warn('Could not create folder, saving to root:', e);
    return null;
  }
}

function formatFileSize(bytes?: string | number): string {
  if (!bytes) return 'Unknown size';
  const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(b) || b <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
