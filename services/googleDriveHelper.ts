/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoogleDriveFileInfo {
  fileId: string | null;
  directImageUrl: string | null;
  previewUrl: string | null;
  viewUrl: string | null;
  isValidDriveUrl: boolean;
}

/**
 * Extracts Google Drive file ID from varied share formats and generates
 * direct formatted image URLs and preview links.
 */
export function parseGoogleDriveUrl(url?: string): GoogleDriveFileInfo {
  if (!url || typeof url !== 'string') {
    return {
      fileId: null,
      directImageUrl: null,
      previewUrl: null,
      viewUrl: null,
      isValidDriveUrl: false,
    };
  }

  const trimmed = url.trim();

  // Pattern 1: /file/d/([a-zA-Z0-9_-]+)
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    const id = fileDMatch[1];
    return formatDriveId(id);
  }

  // Pattern 2: id=([a-zA-Z0-9_-]+)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    const id = idParamMatch[1];
    return formatDriveId(id);
  }

  // Pattern 3: direct ID string (e.g. 1A2b3C... without URL)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return formatDriveId(trimmed);
  }

  // If already a regular image URL
  return {
    fileId: null,
    directImageUrl: trimmed,
    previewUrl: trimmed,
    viewUrl: trimmed,
    isValidDriveUrl: false,
  };
}

function formatDriveId(fileId: string): GoogleDriveFileInfo {
  return {
    fileId,
    // Google's high-speed CDN image thumbnail service (supports up to 1600px)
    directImageUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    isValidDriveUrl: true,
  };
}
