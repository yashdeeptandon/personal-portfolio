// API Response Messages
export const API_MESSAGES = {
  // Success Messages
  SUCCESS: "Operation completed successfully",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",

  // Authentication Messages
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "Registration successful",
  PASSWORD_RESET_SUCCESS: "Password reset email sent",

  // Error Messages
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation error",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  CONFLICT: "Resource already exists",

  // Authentication Errors
  INVALID_CREDENTIALS: "Invalid email or password",
  TOKEN_EXPIRED: "Token has expired",
  TOKEN_INVALID: "Invalid token",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already exists",

  // Blog Messages
  BLOG_NOT_FOUND: "Blog post not found",
  BLOG_CREATED: "Blog post created successfully",
  BLOG_UPDATED: "Blog post updated successfully",
  BLOG_DELETED: "Blog post deleted successfully",
  BLOG_PUBLISHED: "Blog post published successfully",

  // Project Messages
  PROJECT_NOT_FOUND: "Project not found",
  PROJECT_CREATED: "Project created successfully",
  PROJECT_UPDATED: "Project updated successfully",
  PROJECT_DELETED: "Project deleted successfully",

  // Testimonial Messages
  TESTIMONIAL_NOT_FOUND: "Testimonial not found",
  TESTIMONIAL_CREATED: "Testimonial submitted successfully",
  TESTIMONIAL_UPDATED: "Testimonial updated successfully",
  TESTIMONIAL_DELETED: "Testimonial deleted successfully",
  TESTIMONIAL_APPROVED: "Testimonial approved successfully",
  TESTIMONIAL_REJECTED: "Testimonial rejected successfully",

  // Contact Messages
  CONTACT_CREATED: "Message sent successfully",
  CONTACT_NOT_FOUND: "Contact message not found",
  CONTACT_UPDATED: "Contact message updated successfully",

  // Newsletter Messages
  NEWSLETTER_SUBSCRIBED: "Successfully subscribed to newsletter",
  NEWSLETTER_UNSUBSCRIBED: "Successfully unsubscribed from newsletter",
  NEWSLETTER_ALREADY_SUBSCRIBED: "Email already subscribed",

  // File Upload Messages
  FILE_UPLOADED: "File uploaded successfully",
  FILE_UPLOAD_ERROR: "File upload failed",
  FILE_TOO_LARGE: "File size too large",
  FILE_TYPE_NOT_SUPPORTED: "File type not supported",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT: "createdAt",
  DEFAULT_ORDER: "desc",
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// Rate Limiting Configuration
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
  },
  CONTACT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 contact form submissions per hour
  },
  NEWSLETTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 newsletter subscriptions per hour
  },
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

// Blog Categories
export const BLOG_CATEGORIES = [
  "web-development",
  "mobile-development",
  "backend-development",
  "frontend-development",
  "full-stack",
  "devops",
  "database",
  "api",
  "tutorial",
  "tips-tricks",
  "career",
  "technology",
  "programming",
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "python",
  "other",
] as const;

// Project Categories
export const PROJECT_CATEGORIES = [
  "web-application",
  "mobile-application",
  "desktop-application",
  "api",
  "library",
  "tool",
  "game",
  "portfolio",
  "e-commerce",
  "blog",
  "cms",
  "dashboard",
  "landing-page",
  "other",
] as const;

// Project Technologies
export const TECHNOLOGIES = [
  // Frontend
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Svelte",
  "Tailwind CSS",
  "Bootstrap",
  "Sass",
  "Less",
  "Styled Components",

  // Backend
  "Node.js",
  "Express.js",
  "Nest.js",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "PHP",
  "Laravel",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "Ruby",
  "Ruby on Rails",
  "Go",
  "Rust",
  "Kotlin",

  // Databases
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "Redis",
  "Firebase",
  "Supabase",
  "DynamoDB",
  "Cassandra",
  "Elasticsearch",

  // Cloud & DevOps
  "AWS",
  "Google Cloud",
  "Azure",
  "Vercel",
  "Netlify",
  "Heroku",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "GitHub Actions",
  "GitLab CI",
  "Terraform",

  // Mobile
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "Ionic",
  "Xamarin",

  // Tools & Others
  "Git",
  "GitHub",
  "GitLab",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Webpack",
  "Vite",
  "Babel",
  "ESLint",
  "Prettier",
  "Jest",
  "Cypress",
  "Playwright",
] as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  CONTACT_CONFIRMATION: "contact-confirmation",
  CONTACT_NOTIFICATION: "contact-notification",
  NEWSLETTER_WELCOME: "newsletter-welcome",
  NEWSLETTER_UNSUBSCRIBE: "newsletter-unsubscribe",
  TESTIMONIAL_CONFIRMATION: "testimonial-confirmation",
  BLOG_NOTIFICATION: "blog-notification",
} as const;

// SEO Defaults
export const SEO_DEFAULTS = {
  TITLE_SUFFIX: " | Your Portfolio",
  DEFAULT_DESCRIPTION:
    "Full-stack developer specializing in modern web technologies",
  DEFAULT_KEYWORDS: [
    "web developer",
    "full-stack",
    "javascript",
    "react",
    "nextjs",
  ],
  OG_TYPE: "website",
  TWITTER_CARD: "summary_large_image",
} as const;

// Analytics Event Types
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  BLOG_VIEW: "blog_view",
  PROJECT_VIEW: "project_view",
  CONTACT_FORM: "contact_form",
  NEWSLETTER_SUBSCRIPTION: "newsletter_subscription",
  DOWNLOAD: "download",
  CLICK: "click",
} as const;
