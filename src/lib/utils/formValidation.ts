/**
 * Form validation utilities
 * Provides reusable validation functions for common form fields
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Please provide a valid email address" };
  }
  
  return { isValid: true };
};

/**
 * Validate name field
 */
export const validateName = (name: string, minLength = 2, maxLength = 100): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: "Name is required" };
  }
  
  if (trimmedName.length < minLength) {
    return { isValid: false, error: `Name must be at least ${minLength} characters long` };
  }
  
  if (trimmedName.length > maxLength) {
    return { isValid: false, error: `Name cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate subject field
 */
export const validateSubject = (subject: string, minLength = 5, maxLength = 200): { isValid: boolean; error?: string } => {
  const trimmedSubject = subject.trim();
  
  if (!trimmedSubject) {
    return { isValid: false, error: "Subject is required" };
  }
  
  if (trimmedSubject.length < minLength) {
    return { isValid: false, error: `Subject must be at least ${minLength} characters long` };
  }
  
  if (trimmedSubject.length > maxLength) {
    return { isValid: false, error: `Subject cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate message field
 */
export const validateMessage = (message: string, minLength = 20, maxLength = 2000): { isValid: boolean; error?: string } => {
  const trimmedMessage = message.trim();
  
  if (!trimmedMessage) {
    return { isValid: false, error: "Message is required" };
  }
  
  if (trimmedMessage.length < minLength) {
    return { isValid: false, error: `Message must be at least ${minLength} characters long` };
  }
  
  if (trimmedMessage.length > maxLength) {
    return { isValid: false, error: `Message cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number (optional field)
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // Phone is optional
  }
  
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{0,15}$/;
  
  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, error: "Please provide a valid phone number" };
  }
  
  return { isValid: true };
};

/**
 * Validate company field (optional)
 */
export const validateCompany = (company: string, maxLength = 100): { isValid: boolean; error?: string } => {
  if (!company || !company.trim()) {
    return { isValid: true }; // Company is optional
  }
  
  if (company.trim().length > maxLength) {
    return { isValid: false, error: `Company name cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate entire contact form
 */
export const validateContactForm = (formData: ContactFormData): ValidationResult => {
  const errors: string[] = [];
  
  // Validate required fields
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.push(nameValidation.error!);
  }
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.error!);
  }
  
  const subjectValidation = validateSubject(formData.subject);
  if (!subjectValidation.isValid) {
    errors.push(subjectValidation.error!);
  }
  
  const messageValidation = validateMessage(formData.message);
  if (!messageValidation.isValid) {
    errors.push(messageValidation.error!);
  }
  
  // Validate optional fields
  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error!);
    }
  }
  
  if (formData.company) {
    const companyValidation = validateCompany(formData.company);
    if (!companyValidation.isValid) {
      errors.push(companyValidation.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize form data by trimming whitespace
 */
export const sanitizeContactForm = (formData: ContactFormData): ContactFormData => {
  return {
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    subject: formData.subject.trim(),
    message: formData.message.trim(),
    phone: formData.phone?.trim() || undefined,
    company: formData.company?.trim() || undefined,
  };
};

/**
 * Get character count for form fields
 */
export const getCharacterCount = (text: string, maxLength: number): { count: number; remaining: number; isOverLimit: boolean } => {
  const count = text.length;
  const remaining = maxLength - count;
  const isOverLimit = count > maxLength;
  
  return {
    count,
    remaining,
    isOverLimit,
  };
};
