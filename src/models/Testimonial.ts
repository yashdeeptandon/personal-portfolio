import mongoose, { Schema } from 'mongoose';
import { ITestimonial } from '@/types';

const TestimonialSchema = new Schema<ITestimonial>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: [true, 'Testimonial content is required'],
    maxlength: [1000, 'Testimonial content cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  linkedinUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/www\.linkedin\.com\//.test(v);
      },
      message: 'LinkedIn URL must be a valid LinkedIn profile URL'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
TestimonialSchema.index({ email: 1 });
TestimonialSchema.index({ status: 1 });
TestimonialSchema.index({ featured: 1 });
TestimonialSchema.index({ order: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ projectId: 1 });
TestimonialSchema.index({ createdAt: -1 });

// Text index for search functionality
TestimonialSchema.index({
  name: 'text',
  company: 'text',
  position: 'text',
  content: 'text'
});

// Virtual for full name with company
TestimonialSchema.virtual('fullTitle').get(function() {
  if (this.position && this.company) {
    return `${this.position} at ${this.company}`;
  }
  if (this.position) return this.position;
  if (this.company) return this.company;
  return '';
});

// Virtual for star rating display
TestimonialSchema.virtual('starRating').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Virtual for initials (for avatar fallback)
TestimonialSchema.virtual('initials').get(function() {
  return this.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
});

// Static method to find approved testimonials
TestimonialSchema.statics.findApproved = function(options: any = {}) {
  return this.find({ status: 'approved' }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method to find featured testimonials
TestimonialSchema.statics.findFeatured = function(options: any = {}) {
  return this.find({ 
    status: 'approved', 
    featured: true 
  }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method to find by project
TestimonialSchema.statics.findByProject = function(projectId: string, options: any = {}) {
  return this.find({ 
    projectId, 
    status: 'approved' 
  }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method to find by rating
TestimonialSchema.statics.findByRating = function(minRating: number = 4, options: any = {}) {
  return this.find({ 
    rating: { $gte: minRating },
    status: 'approved' 
  }, null, options).sort({ rating: -1, order: 1, createdAt: -1 });
};

// Static method to find pending testimonials
TestimonialSchema.statics.findPending = function(options: any = {}) {
  return this.find({ status: 'pending' }, null, options).sort({ createdAt: -1 });
};

// Static method for search
TestimonialSchema.statics.search = function(query: string, options: any = {}) {
  return this.find({
    $text: { $search: query },
    status: 'approved'
  }, { score: { $meta: 'textScore' } }, options)
  .sort({ score: { $meta: 'textScore' }, order: 1, createdAt: -1 });
};

// Instance method to approve testimonial
TestimonialSchema.methods.approve = function() {
  this.status = 'approved';
  return this.save();
};

// Instance method to reject testimonial
TestimonialSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Instance method to mark as featured
TestimonialSchema.methods.markAsFeatured = function() {
  this.featured = true;
  return this.save();
};

// Instance method to unmark as featured
TestimonialSchema.methods.unmarkAsFeatured = function() {
  this.featured = false;
  return this.save();
};

// Pre-save middleware to populate project reference
TestimonialSchema.pre('save', function(next) {
  // Auto-generate avatar URL if not provided (using a service like Gravatar or UI Avatars)
  if (!this.avatar) {
    // Using UI Avatars as fallback
    const name = encodeURIComponent(this.name);
    this.avatar = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=200`;
  }
  
  next();
});

const Testimonial = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;
