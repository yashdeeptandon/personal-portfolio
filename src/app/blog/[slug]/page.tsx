import { notFound } from "next/navigation";
import Link from "next/link";

// This would typically come from a CMS or database
const blogPosts = [
  {
    id: 1,
    title: "Building Scalable React Applications: Best Practices and Patterns",
    excerpt:
      "Learn how to structure React applications for scalability, maintainability, and performance. This comprehensive guide covers component architecture, state management, and optimization techniques.",
    content: `
# Building Scalable React Applications: Best Practices and Patterns

React has become the go-to library for building user interfaces, but as applications grow in complexity, maintaining scalability becomes crucial. In this comprehensive guide, we'll explore the best practices and patterns that will help you build React applications that can scale effectively.

## Component Architecture

### 1. Component Composition over Inheritance

React favors composition over inheritance. Instead of creating complex inheritance hierarchies, compose smaller, focused components to build larger ones.

\`\`\`jsx
// Good: Composition
const UserProfile = ({ user }) => (
  <div>
    <Avatar user={user} />
    <UserInfo user={user} />
    <UserActions user={user} />
  </div>
);

// Avoid: Large monolithic components
const UserProfile = ({ user }) => (
  <div>
    {/* 200+ lines of JSX */}
  </div>
);
\`\`\`

### 2. Single Responsibility Principle

Each component should have a single, well-defined responsibility. This makes components easier to test, maintain, and reuse.

## State Management

### 1. Local State vs Global State

Not all state needs to be global. Use local state for component-specific data and global state for data that needs to be shared across multiple components.

\`\`\`jsx
// Local state for form inputs
const ContactForm = () => {
  const [formData, setFormData] = useState({});
  // ...
};

// Global state for user authentication
const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);
  // ...
};
\`\`\`

### 2. State Normalization

Normalize your state structure to avoid deeply nested objects and make updates more efficient.

## Performance Optimization

### 1. React.memo and useMemo

Use React.memo for component memoization and useMemo for expensive calculations.

\`\`\`jsx
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  return <div>{processedData}</div>;
});
\`\`\`

### 2. Code Splitting

Implement code splitting to reduce initial bundle size and improve loading performance.

\`\`\`jsx
const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
);
\`\`\`

## Testing Strategy

### 1. Unit Tests

Test individual components in isolation using React Testing Library.

\`\`\`jsx
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

test('renders user name', () => {
  const user = { name: 'John Doe' };
  render(<UserProfile user={user} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
\`\`\`

### 2. Integration Tests

Test how components work together and interact with external services.

## Conclusion

Building scalable React applications requires careful planning and adherence to best practices. By following these patterns and principles, you'll create applications that are maintainable, performant, and easy to scale as your project grows.

Remember, scalability isn't just about handling more users—it's about creating code that can evolve with your requirements while maintaining quality and performance.
    `,
    category: "React",
    tags: ["React", "JavaScript", "Architecture", "Best Practices"],
    author: "John Doe",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    featured: true,
    image: "/blog-react-patterns.jpg",
    slug: "building-scalable-react-applications",
  },
  {
    id: 2,
    title: "The Future of Web Development: Trends to Watch in 2024",
    excerpt:
      "Explore the emerging trends shaping web development in 2024, from AI integration to new frameworks and development methodologies.",
    content: `
# The Future of Web Development: Trends to Watch in 2024

As we progress through 2024, the web development landscape continues to evolve rapidly. New technologies, frameworks, and methodologies are reshaping how we build and deploy web applications. Let's explore the key trends that are defining the future of web development.

## 1. AI-Powered Development Tools

Artificial Intelligence is revolutionizing how developers write code, debug applications, and optimize performance.

### GitHub Copilot and Beyond

AI-powered code completion tools are becoming more sophisticated, helping developers write better code faster.

### Automated Testing and QA

AI is being integrated into testing frameworks to automatically generate test cases and identify potential bugs.

## 2. Edge Computing and CDNs

The shift towards edge computing is bringing computation closer to users, resulting in faster load times and better user experiences.

### Edge Functions

Serverless functions running at the edge are enabling new possibilities for dynamic content delivery.

### Global Distribution

Modern CDNs are becoming more intelligent, automatically optimizing content delivery based on user location and device capabilities.

## 3. WebAssembly (WASM) Adoption

WebAssembly is gaining traction for performance-critical applications, allowing developers to run near-native code in browsers.

### Use Cases

- Image and video processing
- Games and simulations
- Scientific computing
- Legacy application migration

## 4. Progressive Web Apps (PWAs) Evolution

PWAs continue to bridge the gap between web and native applications, with improved capabilities and better platform integration.

### New APIs

- Web Share API
- Background Sync
- Push Notifications
- Offline Storage

## 5. Micro-Frontends Architecture

Large organizations are adopting micro-frontends to enable independent team development and deployment.

### Benefits

- Team autonomy
- Technology diversity
- Independent deployments
- Scalable development

## 6. Sustainability in Web Development

Environmental consciousness is driving the adoption of green coding practices and energy-efficient web development.

### Green Metrics

- Carbon footprint measurement
- Energy-efficient algorithms
- Optimized resource usage
- Sustainable hosting solutions

## Conclusion

The future of web development is exciting and full of possibilities. By staying informed about these trends and continuously learning new technologies, developers can build better, faster, and more sustainable web applications.

The key is to balance innovation with practicality, adopting new technologies when they provide real value while maintaining focus on user experience and performance.
    `,
    category: "Web Development",
    tags: ["Trends", "Web Development", "2024", "AI", "Future"],
    author: "John Doe",
    publishDate: "2024-01-10",
    readTime: "6 min read",
    featured: true,
    image: "/blog-web-trends.jpg",
    slug: "future-of-web-development-2024",
  },
  // Add more blog posts as needed
];

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
              John Doe
            </Link>
            <Link
              href="/#blog"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium mr-4">
                  {post.category}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {formatDate(post.publishDate)} • {post.readTime}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {post.title}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        </div>

        {/* Author Section */}
        <div className="bg-gray-50 dark:bg-gray-800 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-6">
                JD
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {post.author}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Full-Stack Developer & Software Engineer
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Passionate about building scalable web applications and
                  sharing knowledge with the developer community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
              More Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts
                .filter((p) => p.id !== post.id)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-gray-400 to-gray-600">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-30">
                        {relatedPost.title.charAt(0)}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                          {relatedPost.category}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-3">
                          {relatedPost.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {relatedPost.excerpt.substring(0, 120)}...
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}
