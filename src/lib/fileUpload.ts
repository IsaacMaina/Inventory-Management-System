// src/lib/fileUpload.ts
import { v4 as uuidv4 } from 'cuid';
import path from 'path';
import fs from 'fs/promises';
import { validateAndSanitizeEmail } from './validation';

// Configuration for file uploads
interface UploadConfig {
  maxFileSize: number; // in bytes (e.g., 5 * 1024 * 1024 for 5MB)
  allowedTypes: string[];
  uploadDir: string;
}

// Default configuration
const defaultConfig: UploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  uploadDir: './public/uploads'
};

// Validate file type
export function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

// Validate file size
export function isValidFileSize(fileSize: number, maxFileSize: number): boolean {
  return fileSize <= maxFileSize;
}

// Sanitize file name to prevent path traversal and other attacks
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const sanitized = fileName.replace(/(\.\.\/|\.\\\.\.\\|\.\/\.\/)/g, '');
  
  // Get just the file name without path
  const baseName = path.basename(sanitized);
  
  // Remove any potentially dangerous characters
  const cleanName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Generate a unique name to prevent conflicts and guessing
  const ext = path.extname(cleanName);
  const name = path.basename(cleanName, ext);
  const uniqueName = `${name}_${uuidv4()}${ext}`;
  
  return uniqueName;
}

// Validate and process uploaded file
export async function processUploadedFile(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string,
  config: UploadConfig = defaultConfig
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    // Validate file type
    if (!isValidFileType(mimeType, config.allowedTypes)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    // Validate file size
    if (!isValidFileSize(fileBuffer.length, config.maxFileSize)) {
      return {
        success: false,
        error: `File size too large. Maximum size: ${config.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Sanitize file name
    const sanitizedFileName = sanitizeFileName(fileName);

    // Ensure upload directory exists
    await fs.mkdir(config.uploadDir, { recursive: true });

    // Create full file path
    const filePath = path.join(config.uploadDir, sanitizedFileName);

    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);

    return {
      success: true,
      filePath: `/uploads/${sanitizedFileName}` // Return web-accessible path
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Failed to process uploaded file'
    };
  }
}

// Alternative function for handling files from Next.js API routes
export async function handleFileUpload(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  config: UploadConfig = defaultConfig
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Additional security checks could go here
  // For example, check if the file is actually an image by reading its header
  
  const result = await processUploadedFile(fileBuffer, fileName, mimeType, config);
  
  if (result.success && result.filePath) {
    return {
      success: true,
      url: result.filePath
    };
  }
  
  return result;
}

// Validate image file by checking its magic numbers/headers
export async function validateImageFile(fileBuffer: Buffer, mimeType: string): Promise<boolean> {
  if (!mimeType.startsWith('image/')) {
    return false;
  }

  // Read the first few bytes to check the file header
  if (fileBuffer.length < 4) {
    return false;
  }

  // Check for common image file headers
  const header = fileBuffer.subarray(0, 4);
  const hex = Buffer.from(header).toString('hex').toLowerCase();

  switch (mimeType) {
    case 'image/jpeg':
      return hex.startsWith('ffd8');
    case 'image/png':
      return hex === '89504e47';
    case 'image/gif':
      return hex.startsWith('47494638'); // GIF8
    case 'image/webp':
      return hex === '52494646' && fileBuffer.subarray(8, 12).toString() === 'WEBP';
    default:
      return false;
  }
}

// Enhanced upload function with image validation
export async function secureImageUpload(
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string,
  config: UploadConfig = defaultConfig
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file type
    if (!isValidFileType(mimeType, config.allowedTypes)) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    // Validate file size
    if (!isValidFileSize(fileBuffer.length, config.maxFileSize)) {
      return {
        success: false,
        error: `File size too large. Maximum size: ${config.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Validate that the file is actually an image by checking headers
    const isActuallyImage = await validateImageFile(fileBuffer, mimeType);
    if (!isActuallyImage) {
      return {
        success: false,
        error: 'File is not a valid image'
      };
    }

    // Sanitize file name
    const sanitizedFileName = sanitizeFileName(fileName);

    // Ensure upload directory exists
    await fs.mkdir(config.uploadDir, { recursive: true });

    // Create full file path
    const filePath = path.join(config.uploadDir, sanitizedFileName);

    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);

    return {
      success: true,
      url: `/uploads/${sanitizedFileName}`
    };
  } catch (error) {
    console.error('Secure image upload error:', error);
    return {
      success: false,
      error: 'Failed to process uploaded file'
    };
  }
}