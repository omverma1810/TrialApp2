/**
 * Voice Note Upload Utility
 * Handles uploading voice recordings to pre-signed S3 URLs
 * Similar flow to image uploads but for audio files
 */

import axios from 'axios';
import {Buffer} from 'buffer';
import {Platform} from 'react-native';

export interface VoiceNoteUploadData {
  audioBase64: string;
  fileName: string;
  duration: number;
  mimeType: string;
  timestamp?: number;
}

export interface VoiceNoteUploadResult {
  success: boolean;
  s3Path?: string;
  error?: string;
}

/**
 * Upload voice note to pre-signed S3 URL
 * @param preSignedUrl - The pre-signed URL from the server (use as-is, don't modify)
 * @param audioBase64 - Base64 encoded audio data
 * @param contentType - MIME type returned by backend (e.g., 'audio/mp4', 'audio/mpeg')
 * @returns Promise that resolves when upload is complete
 */
export const uploadVoiceNoteToS3 = async (
  preSignedUrl: string,
  audioBase64: string,
  contentType: string,
): Promise<void> => {
  try {
    console.log('\n🔄 Converting audio data for S3 upload...');
    console.log('  - Input: Base64 string');
    console.log('  - Base64 length:', audioBase64.length, 'characters');

    // Convert base64 string to binary Buffer
    const binaryData = Buffer.from(audioBase64, 'base64');

    console.log('  - Output: Binary Buffer');
    console.log('  - Binary size:', binaryData.length, 'bytes');
    console.log('  - Content-Type (from backend):', contentType);
    console.log('  - Upload method: axios.put()');
    console.log('  - Using exact presigned URL from backend');
    console.log('✅ Conversion complete\n');

    // Upload to S3 using ONLY the Content-Type header from backend
    // Do NOT add any extra headers
    await axios.put(preSignedUrl, binaryData, {
      headers: {
        'Content-Type': contentType,
      },
    });

    console.log('✅ Binary data successfully uploaded to S3\n');
  } catch (error) {
    console.error('❌ Error uploading voice note to S3:', error);
    if (axios.isAxiosError(error)) {
      console.error('  - Status:', error.response?.status);
      console.error('  - Status Text:', error.response?.statusText);
      console.error('  - Response Data:', error.response?.data);
    }
    throw new Error('Failed to upload voice note to S3');
  }
};

/**
 * Generate file name for voice note based on platform
 * @param timestamp - Optional timestamp for the file name
 * @returns File name with appropriate extension
 */
export const generateVoiceNoteFileName = (timestamp?: number): string => {
  const ts = timestamp || Date.now();
  const fileExtension = Platform.OS === 'ios' ? 'm4a' : 'mp3';
  return `voice_note_${ts}.${fileExtension}`;
};

/**
 * Get MIME type based on platform
 * @returns Appropriate MIME type for the platform
 */
export const getVoiceNoteMimeType = (): string => {
  return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mpeg';
};

/**
 * Generate query params for voice note pre-signed URL request
 * @param plotId - The plot ID
 * @param fileName - The audio file name
 * @returns Query params string
 */
export const generateVoiceNoteQueryParams = (
  plotId: number,
  fileName: string,
): string => {
  // Backend expects: plot_id and file_name (same pattern as image_name for images)
  // Format: plot_id=123&file_name=voice_note_123.m4a
  return `plot_id=${plotId}&file_name=${fileName}`;
};
