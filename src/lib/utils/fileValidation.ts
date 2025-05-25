import { FILE_UPLOAD } from "./constants";

export interface FileValidationResult {
  valid: File[];
  errors: string[];
  totalSize: number;
  validCount: number;
  errorCount: number;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  allowMultiple?: boolean;
}

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Check if file type is an image
 */
export const isImageFile = (file: File): boolean => {
  return FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type as any);
};

/**
 * Check if file type is a document
 */
export const isDocumentFile = (file: File): boolean => {
  return FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.includes(file.type as any);
};

/**
 * Get file category based on type
 */
export const getFileCategory = (file: File): "image" | "document" | "other" => {
  if (isImageFile(file)) return "image";
  if (isDocumentFile(file)) return "document";
  return "other";
};

/**
 * Validate a single file
 */
export const validateSingleFile = (
  file: File,
  options: FileValidationOptions = {}
): { isValid: boolean; error?: string } => {
  const {
    maxSize = FILE_UPLOAD.MAX_SIZE,
    allowedTypes = [
      ...FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
      ...FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES,
    ],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds ${formatFileSize(maxSize)} limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "File is empty",
    };
  }

  return { isValid: true };
};

/**
 * Validate multiple files
 */
export const validateFiles = (
  files: FileList | File[],
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    maxSize = FILE_UPLOAD.MAX_SIZE,
    allowedTypes = [
      ...FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
      ...FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES,
    ],
    maxFiles = 10,
    allowMultiple = true,
  } = options;

  const valid: File[] = [];
  const errors: string[] = [];
  const fileArray = Array.from(files);

  // Check if multiple files are allowed
  if (!allowMultiple && fileArray.length > 1) {
    errors.push("Only one file is allowed");
    return {
      valid: [],
      errors,
      totalSize: 0,
      validCount: 0,
      errorCount: fileArray.length,
    };
  }

  // Check maximum number of files
  if (fileArray.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    return {
      valid: [],
      errors,
      totalSize: 0,
      validCount: 0,
      errorCount: fileArray.length,
    };
  }

  let totalSize = 0;

  fileArray.forEach((file, index) => {
    const validation = validateSingleFile(file, { maxSize, allowedTypes });
    
    if (validation.isValid) {
      valid.push(file);
      totalSize += file.size;
    } else {
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  return {
    valid,
    errors,
    totalSize,
    validCount: valid.length,
    errorCount: errors.length,
  };
};

/**
 * Create a preview URL for a file (for images)
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate a safe filename
 */
export const generateSafeFilename = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const extension = getFileExtension(originalName);
  const nameWithoutExt = sanitizedName.replace(`.${extension}`, "");
  
  if (prefix) {
    return `${prefix}/${timestamp}_${nameWithoutExt}.${extension}`;
  }
  
  return `${timestamp}_${nameWithoutExt}.${extension}`;
};

/**
 * Check if drag and drop is supported
 */
export const isDragAndDropSupported = (): boolean => {
  const div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
};
