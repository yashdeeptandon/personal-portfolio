import mongoose, { Schema } from 'mongoose';
import { INewsletter } from '@/types';

const NewsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['website', 'blog', 'social', 'referral'],
    default: 'website'
  },
  preferences: {
    blogUpdates: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ status: 1 });
NewsletterSchema.index({ source: 1 });
NewsletterSchema.index({ subscribedAt: -1 });
NewsletterSchema.index({ 'preferences.blogUpdates': 1 });
NewsletterSchema.index({ 'preferences.projectUpdates': 1 });
NewsletterSchema.index({ 'preferences.newsletter': 1 });

// Virtual for display name
NewsletterSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Virtual for subscription duration
NewsletterSchema.virtual('subscriptionDuration').get(function() {
  const now = new Date();
  const subscribed = new Date(this.subscribedAt);
  const diffTime = Math.abs(now.getTime() - subscribed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
  return `${Math.ceil(diffDays / 365)} years`;
});

// Static method to find active subscribers
NewsletterSchema.statics.findActive = function(options: any = {}) {
  return this.find({ status: 'active' }, null, options).sort({ subscribedAt: -1 });
};

// Static method to find subscribers by preference
NewsletterSchema.statics.findByPreference = function(preference: string, options: any = {}) {
  const query: any = { status: 'active' };
  query[`preferences.${preference}`] = true;
  return this.find(query, null, options).sort({ subscribedAt: -1 });
};

// Static method to find blog subscribers
NewsletterSchema.statics.findBlogSubscribers = function(options: any = {}) {
  return this.find({ 
    status: 'active',
    'preferences.blogUpdates': true 
  }, null, options).sort({ subscribedAt: -1 });
};

// Static method to find project subscribers
NewsletterSchema.statics.findProjectSubscribers = function(options: any = {}) {
  return this.find({ 
    status: 'active',
    'preferences.projectUpdates': true 
  }, null, options).sort({ subscribedAt: -1 });
};

// Static method to find newsletter subscribers
NewsletterSchema.statics.findNewsletterSubscribers = function(options: any = {}) {
  return this.find({ 
    status: 'active',
    'preferences.newsletter': true 
  }, null, options).sort({ subscribedAt: -1 });
};

// Static method to find by source
NewsletterSchema.statics.findBySource = function(source: string, options: any = {}) {
  return this.find({ source }, null, options).sort({ subscribedAt: -1 });
};

// Instance method to unsubscribe
NewsletterSchema.methods.unsubscribe = function() {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  return this.save();
};

// Instance method to resubscribe
NewsletterSchema.methods.resubscribe = function() {
  this.status = 'active';
  this.unsubscribedAt = null;
  return this.save();
};

// Instance method to mark as bounced
NewsletterSchema.methods.markAsBounced = function() {
  this.status = 'bounced';
  return this.save();
};

// Instance method to update preferences
NewsletterSchema.methods.updatePreferences = function(preferences: Partial<INewsletter['preferences']>) {
  Object.assign(this.preferences, preferences);
  return this.save();
};

const Newsletter = mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);

export default Newsletter;
