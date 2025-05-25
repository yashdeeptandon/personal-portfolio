import Link from "next/link";
import Newsletter from "@/components/Newsletter";

// This would typically come from a CMS or database
const blogPosts = [
  {
    id: 1,
    title: "Building Scalable React Applications: Best Practices and Patterns",
    excerpt:
      "Learn how to structure React applications for scalability, maintainability, and performance. This comprehensive guide covers component architecture, state management, and optimization techniques.",
    category: "React",
    tags: ["React", "JavaScript", "Architecture", "Best Practices"],
    author: "Yashdeep Tandon",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    featured: true,
    slug: "building-scalable-react-applications",
  },
  {
    id: 2,
    title: "The Future of Web Development: Trends to Watch in 2024",
    excerpt:
      "Explore the emerging trends shaping web development in 2024, from AI integration to new frameworks and development methodologies.",
    category: "Web Development",
    tags: ["Trends", "Web Development", "2024", "AI", "Future"],
    author: "Yashdeep Tandon",
    publishDate: "2024-01-10",
    readTime: "6 min read",
    featured: true,
    slug: "future-of-web-development-2024",
  },
  {
    id: 3,
    title: "Mastering TypeScript: Advanced Types and Patterns",
    excerpt:
      "Dive deep into TypeScript's advanced type system and learn how to leverage powerful patterns for better code quality and developer experience.",
    category: "TypeScript",
    tags: ["TypeScript", "JavaScript", "Types", "Advanced"],
    author: "Yashdeep Tandon",
    publishDate: "2024-01-05",
    readTime: "10 min read",
    featured: false,
    slug: "mastering-typescript-advanced-types",
  },
  {
    id: 4,
    title: "Optimizing Next.js Performance: A Complete Guide",
    excerpt:
      "Learn how to optimize your Next.js applications for maximum performance with code splitting, image optimization, and caching strategies.",
    category: "Next.js",
    tags: ["Next.js", "Performance", "Optimization", "React"],
    author: "Yashdeep Tandon",
    publishDate: "2023-12-28",
    readTime: "12 min read",
    featured: false,
    slug: "optimizing-nextjs-performance",
  },
  {
    id: 5,
    title: "Building RESTful APIs with Node.js and Express",
    excerpt:
      "A comprehensive guide to building robust, scalable RESTful APIs using Node.js, Express, and modern best practices.",
    category: "Backend",
    tags: ["Node.js", "Express", "API", "Backend", "REST"],
    author: "Yashdeep Tandon",
    publishDate: "2023-12-20",
    readTime: "15 min read",
    featured: true,
    slug: "building-restful-apis-nodejs-express",
  },
  {
    id: 6,
    title: "CSS Grid vs Flexbox: When to Use Which",
    excerpt:
      "Understanding the differences between CSS Grid and Flexbox, and knowing when to use each layout method for optimal results.",
    category: "CSS",
    tags: ["CSS", "Grid", "Flexbox", "Layout", "Frontend"],
    author: "Yashdeep Tandon",
    publishDate: "2023-12-15",
    readTime: "7 min read",
    featured: false,
    slug: "css-grid-vs-flexbox-when-to-use",
  },
];

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const featuredPosts = blogPosts.filter((post) => post.featured);
  const recentPosts = blogPosts.slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Yashdeep Tandon
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#about"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/newsletter"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Newsletter
              </Link>
              <Link
                href="/#contact"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Blog & Articles
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Insights, tutorials, and thoughts on web development, technology
              trends, and software engineering
            </p>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold opacity-20">
                    {post.title.charAt(0)}
                  </div>
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {post.readTime}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(post.publishDate)}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>

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
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            All Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
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
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <Newsletter />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Yashdeep Tandon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
