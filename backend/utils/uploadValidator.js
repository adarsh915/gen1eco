/**
 * File upload validation utility
 */

// Allowed MIME types for different file categories
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// File extensions for extra validation
const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  video: ['mp4', 'mpeg', 'mov', 'avi'],
  document: ['pdf', 'doc', 'docx'],
};

// Max file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  document: 10 * 1024 * 1024, // 10MB
  default: 5 * 1024 * 1024, // 5MB
};

/**
 * Validate file upload
 * @param {Object} file - multer file object
 * @param {string} category - file category (image, video, document)
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateFileUpload(file, category = 'image') {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const allowedMimes = ALLOWED_MIME_TYPES[category] || ALLOWED_MIME_TYPES.image;
  const allowedExts = ALLOWED_EXTENSIONS[category] || ALLOWED_EXTENSIONS.image;
  const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.default;

  // Validate MIME type
  if (!allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedMimes.join(', ')}`
    };
  }

  // Validate file extension
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  if (!allowedExts.includes(fileExt)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${allowedExts.join(', ')}`
    };
  }

  // Validate file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  // Additional security: Check for null bytes in filename
  if (file.originalname.includes('\0')) {
    return {
      valid: false,
      error: 'Invalid filename'
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files
 */
function validateMultipleFiles(files, category = 'image', maxCount = 5) {
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files provided' };
  }

  if (files.length > maxCount) {
    return { valid: false, error: `Maximum ${maxCount} files allowed` };
  }

  const errors = [];
  for (const file of files) {
    const validation = validateFileUpload(file, category);
    if (!validation.valid) {
      errors.push(`${file.originalname}: ${validation.error}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }

  return { valid: true };
}

/**
 * Get safe filename by removing potentially dangerous characters
 */
function getSafeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

module.exports = {
  validateFileUpload,
  validateMultipleFiles,
  getSafeFilename,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZES
};
