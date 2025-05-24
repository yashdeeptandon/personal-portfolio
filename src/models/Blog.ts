import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IBlog } from '@/types';

const BlogSchema = new Schema<IBlog>({
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
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  featuredImage: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    default: 'Admin'
  },
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
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
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ likes: -1 });
BlogSchema.index({ createdAt: -1 });

// Text index for search functionality
BlogSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text',
  category: 'text'
});

// Generate slug before saving
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate SEO fields if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt.substring(0, 160);
  }
  
  next();
});

// Virtual for URL
BlogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Virtual for reading time text
BlogSchema.virtual('readTimeText').get(function() {
  return `${this.readTime} min read`;
});

// Static method to find published blogs
BlogSchema.statics.findPublished = function(options: any = {}) {
  return this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() }
  }, null, options).sort({ publishedAt: -1 });
};

// Static method to find by category
BlogSchema.statics.findByCategory = function(category: string, options: any = {}) {
  return this.find({ 
    category: category.toLowerCase(),
    status: 'published',
    publishedAt: { $lte: new Date() }
  }, null, options).sort({ publishedAt: -1 });
};

// Static method to find by tag
BlogSchema.statics.findByTag = function(tag: string, options: any = {}) {
  return this.find({ 
    tags: tag.toLowerCase(),
    status: 'published',
    publishedAt: { $lte: new Date() }
  }, null, options).sort({ publishedAt: -1 });
};

// Static method for search
BlogSchema.statics.search = function(query: string, options: any = {}) {
  return this.find({
    $text: { $search: query },
    status: 'published',
    publishedAt: { $lte: new Date() }
  }, { score: { $meta: 'textScore' } }, options)
  .sort({ score: { $meta: 'textScore' }, publishedAt: -1 });
};

// Instance method to increment views
BlogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to increment likes
BlogSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
