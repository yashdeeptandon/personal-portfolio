import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IProject } from '@/types';

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  featuredImage: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'archived'],
    default: 'planning'
  },
  githubUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/github\.com\//.test(v);
      },
      message: 'GitHub URL must be a valid GitHub repository URL'
    }
  },
  liveUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Live URL must be a valid URL'
    }
  },
  demoUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Demo URL must be a valid URL'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IProject, v: Date) {
        return !v || v >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
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
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ order: 1 });
ProjectSchema.index({ startDate: -1 });
ProjectSchema.index({ endDate: -1 });
ProjectSchema.index({ createdAt: -1 });

// Text index for search functionality
ProjectSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  technologies: 'text',
  category: 'text'
});

// Generate slug before saving
ProjectSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  // Auto-generate SEO fields if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortDescription.substring(0, 160);
  }
  
  // Auto-generate keywords from technologies and category
  if (!this.seo.keywords || this.seo.keywords.length === 0) {
    this.seo.keywords = [...this.technologies, this.category].map(k => k.toLowerCase());
  }
  
  next();
});

// Virtual for URL
ProjectSchema.virtual('url').get(function() {
  return `/projects/${this.slug}`;
});

// Virtual for duration
ProjectSchema.virtual('duration').get(function() {
  if (!this.endDate) return 'Ongoing';
  
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
  return `${Math.ceil(diffDays / 365)} years`;
});

// Virtual for status badge color
ProjectSchema.virtual('statusColor').get(function() {
  const colors = {
    planning: 'blue',
    'in-progress': 'yellow',
    completed: 'green',
    archived: 'gray'
  };
  return colors[this.status] || 'gray';
});

// Static method to find featured projects
ProjectSchema.statics.findFeatured = function(options: any = {}) {
  return this.find({ featured: true }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method to find by category
ProjectSchema.statics.findByCategory = function(category: string, options: any = {}) {
  return this.find({ category: category.toLowerCase() }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method to find by technology
ProjectSchema.statics.findByTechnology = function(technology: string, options: any = {}) {
  return this.find({ technologies: { $in: [technology] } }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method to find by status
ProjectSchema.statics.findByStatus = function(status: string, options: any = {}) {
  return this.find({ status }, null, options).sort({ order: 1, createdAt: -1 });
};

// Static method for search
ProjectSchema.statics.search = function(query: string, options: any = {}) {
  return this.find({
    $text: { $search: query }
  }, { score: { $meta: 'textScore' } }, options)
  .sort({ score: { $meta: 'textScore' }, order: 1, createdAt: -1 });
};

// Instance method to mark as featured
ProjectSchema.methods.markAsFeatured = function() {
  this.featured = true;
  return this.save();
};

// Instance method to unmark as featured
ProjectSchema.methods.unmarkAsFeatured = function() {
  this.featured = false;
  return this.save();
};

const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
