'use client';

import { useState } from 'react';
import Link from 'next/link';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: 1,
      title: 'Building Scalable React Applications: Best Practices and Patterns',
      excerpt: 'Learn how to structure React applications for scalability, maintainability, and performance. This comprehensive guide covers component architecture, state management, and optimization techniques.',
      content: 'In this deep dive into React architecture, we explore the fundamental patterns that make applications scalable...',
      category: 'React',
      tags: ['React', 'JavaScript', 'Architecture', 'Best Practices'],
      author: 'John Doe',
      publishDate: '2024-01-15',
      readTime: '8 min read',
      featured: true,
      image: '/blog-react-patterns.jpg',
      slug: 'building-scalable-react-applications'
    },
    {
      id: 2,
      title: 'The Future of Web Development: Trends to Watch in 2024',
      excerpt: 'Explore the emerging trends shaping web development in 2024, from AI integration to new frameworks and development methodologies.',
      content: 'As we progress through 2024, the web development landscape continues to evolve rapidly...',
      category: 'Web Development',
      tags: ['Trends', 'Web Development', '2024', 'AI', 'Future'],
      author: 'John Doe',
      publishDate: '2024-01-10',
      readTime: '6 min read',
      featured: true,
      image: '/blog-web-trends.jpg',
      slug: 'future-of-web-development-2024'
    },
    {
      id: 3,
      title: 'Mastering TypeScript: Advanced Types and Patterns',
      excerpt: 'Dive deep into TypeScript\'s advanced type system and learn how to leverage powerful patterns for better code quality and developer experience.',
      content: 'TypeScript has become an essential tool for modern JavaScript development...',
      category: 'TypeScript',
      tags: ['TypeScript', 'JavaScript', 'Types', 'Advanced'],
      author: 'John Doe',
      publishDate: '2024-01-05',
      readTime: '10 min read',
      featured: false,
      image: '/blog-typescript.jpg',
      slug: 'mastering-typescript-advanced-types'
    },
    {
      id: 4,
      title: 'Optimizing Next.js Performance: A Complete Guide',
      excerpt: 'Learn how to optimize your Next.js applications for maximum performance with code splitting, image optimization, and caching strategies.',
      content: 'Performance optimization is crucial for modern web applications...',
      category: 'Next.js',
      tags: ['Next.js', 'Performance', 'Optimization', 'React'],
      author: 'John Doe',
      publishDate: '2023-12-28',
      readTime: '12 min read',
      featured: false,
      image: '/blog-nextjs-performance.jpg',
      slug: 'optimizing-nextjs-performance'
    },
    {
      id: 5,
      title: 'Building RESTful APIs with Node.js and Express',
      excerpt: 'A comprehensive guide to building robust, scalable RESTful APIs using Node.js, Express, and modern best practices.',
      content: 'Building APIs is a fundamental skill for full-stack developers...',
      category: 'Backend',
      tags: ['Node.js', 'Express', 'API', 'Backend', 'REST'],
      author: 'John Doe',
      publishDate: '2023-12-20',
      readTime: '15 min read',
      featured: true,
      image: '/blog-nodejs-api.jpg',
      slug: 'building-restful-apis-nodejs-express'
    },
    {
      id: 6,
      title: 'CSS Grid vs Flexbox: When to Use Which',
      excerpt: 'Understanding the differences between CSS Grid and Flexbox, and knowing when to use each layout method for optimal results.',
      content: 'CSS layout has evolved significantly with the introduction of Flexbox and Grid...',
      category: 'CSS',
      tags: ['CSS', 'Grid', 'Flexbox', 'Layout', 'Frontend'],
      author: 'John Doe',
      publishDate: '2023-12-15',
      readTime: '7 min read',
      featured: false,
      image: '/blog-css-grid-flexbox.jpg',
      slug: 'css-grid-vs-flexbox-when-to-use'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Posts' },
    { key: 'React', label: 'React' },
    { key: 'TypeScript', label: 'TypeScript' },
    { key: 'Next.js', label: 'Next.js' },
    { key: 'Backend', label: 'Backend' },
    { key: 'CSS', label: 'CSS' },
    { key: 'Web Development', label: 'Web Dev' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="blog" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sharing insights, tutorials, and thoughts on web development, technology trends, and software engineering
          </p>
        </div>

        {/* Featured Posts */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            🌟 Featured Articles
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.slice(0, 2).map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold opacity-20">
                    {post.title.charAt(0)}
                  </div>
                  <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {post.readTime}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-3">
                      {formatDate(post.publishDate)}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    Read More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 mx-2 mb-4 rounded-lg font-medium transition-all duration-300 text-sm ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* All Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-40 bg-gradient-to-br from-gray-400 to-gray-600">
                <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-30">
                  {post.title.charAt(0)}
                </div>
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {post.readTime}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatDate(post.publishDate)}
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h4>
                
                <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                >
                  Read More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Blog CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Want to Read More?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Subscribe to my newsletter to get the latest articles, tutorials, and insights delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
