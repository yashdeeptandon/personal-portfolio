import mongoose, { Schema } from 'mongoose';
import { ISettings } from '@/types';

const SettingsSchema = new Schema<ISettings>({
  // Site Information
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    maxlength: [100, 'Site name cannot exceed 100 characters']
  },
  siteDescription: {
    type: String,
    required: [true, 'Site description is required'],
    trim: true,
    maxlength: [500, 'Site description cannot exceed 500 characters']
  },
  siteUrl: {
    type: String,
    required: [true, 'Site URL is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Site URL must be a valid URL'
    }
  },
  siteLogo: {
    type: String,
    default: null
  },
  favicon: {
    type: String,
    default: null
  },

  // Contact Information
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  contactPhone: {
    type: String,
    trim: true
  },
  contactAddress: {
    type: String,
    trim: true
  },

  // Social Media Links
  socialMedia: {
    github: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/github\.com\//.test(v);
        },
        message: 'GitHub URL must be a valid GitHub profile URL'
      }
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/www\.linkedin\.com\//.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn profile URL'
      }
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/(twitter\.com|x\.com)\//.test(v);
        },
        message: 'Twitter URL must be a valid Twitter profile URL'
      }
    },
    instagram: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/www\.instagram\.com\//.test(v);
        },
        message: 'Instagram URL must be a valid Instagram profile URL'
      }
    },
    youtube: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https:\/\/www\.youtube\.com\//.test(v);
        },
        message: 'YouTube URL must be a valid YouTube channel URL'
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Website URL must be a valid URL'
      }
    }
  },

  // SEO Settings
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    ogImage: {
      type: String,
      default: null
    }
  },

  // Analytics
  analytics: {
    googleAnalyticsId: {
      type: String,
      trim: true
    },
    googleTagManagerId: {
      type: String,
      trim: true
    },
    facebookPixelId: {
      type: String,
      trim: true
    }
  },

  // Email Settings
  email: {
    fromName: {
      type: String,
      trim: true,
      maxlength: [100, 'From name cannot exceed 100 characters']
    },
    fromEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    replyToEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },

  // Feature Flags
  features: {
    blogEnabled: {
      type: Boolean,
      default: true
    },
    projectsEnabled: {
      type: Boolean,
      default: true
    },
    testimonialsEnabled: {
      type: Boolean,
      default: true
    },
    contactFormEnabled: {
      type: Boolean,
      default: true
    },
    newsletterEnabled: {
      type: Boolean,
      default: true
    },
    commentsEnabled: {
      type: Boolean,
      default: false
    }
  },

  // Maintenance Mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Site is under maintenance. Please check back later.'
    },
    allowedIPs: [{
      type: String
    }]
  },

  // Theme Settings
  theme: {
    primaryColor: {
      type: String,
      default: '#3b82f6'
    },
    secondaryColor: {
      type: String,
      default: '#64748b'
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one settings document exists
SettingsSchema.index({ _id: 1 }, { unique: true });

// Virtual for full site title
SettingsSchema.virtual('fullSiteTitle').get(function() {
  return this.seo?.metaTitle || this.siteName;
});

// Virtual for full site description
SettingsSchema.virtual('fullSiteDescription').get(function() {
  return this.seo?.metaDescription || this.siteDescription;
});

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
