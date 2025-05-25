import dbConnect from './connection';
import User from '@/models/User';
import Blog from '@/models/Blog';
import Project from '@/models/Project';
import Testimonial from '@/models/Testimonial';

export async function seedDatabase() {
  try {
    await dbConnect();
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'admin@portfolio.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        email: 'admin@portfolio.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        name: 'Admin User',
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create sample blog posts
    const existingBlogs = await Blog.countDocuments();
    if (existingBlogs === 0) {
      const sampleBlogs = [
        {
          title: 'Getting Started with Next.js 15',
          content: `
            <p>Next.js 15 brings exciting new features and improvements that make building React applications even more powerful and efficient. In this comprehensive guide, we'll explore the key features and how to get started.</p>
            
            <h2>What's New in Next.js 15</h2>
            <p>Next.js 15 introduces several groundbreaking features:</p>
            <ul>
              <li>Improved App Router with better performance</li>
              <li>Enhanced Server Components</li>
              <li>Better TypeScript support</li>
              <li>Optimized bundling and compilation</li>
            </ul>
            
            <h2>Getting Started</h2>
            <p>To create a new Next.js 15 project, run:</p>
            <pre><code>npx create-next-app@latest my-app</code></pre>
            
            <p>This will set up a new project with all the latest features and best practices.</p>
          `,
          excerpt: 'Explore the exciting new features in Next.js 15 and learn how to build modern React applications with improved performance and developer experience.',
          tags: ['nextjs', 'react', 'javascript', 'web-development'],
          category: 'web-development',
          status: 'published',
          publishedAt: new Date(),
          author: 'Admin User'
        },
        {
          title: 'Building Scalable APIs with Node.js and MongoDB',
          content: `
            <p>Creating scalable and maintainable APIs is crucial for modern web applications. In this tutorial, we'll build a robust API using Node.js, Express, and MongoDB.</p>
            
            <h2>Architecture Overview</h2>
            <p>We'll follow these best practices:</p>
            <ul>
              <li>RESTful API design</li>
              <li>Proper error handling</li>
              <li>Input validation</li>
              <li>Authentication and authorization</li>
              <li>Database optimization</li>
            </ul>
            
            <h2>Setting Up the Project</h2>
            <p>First, let's initialize our project and install dependencies:</p>
            <pre><code>npm init -y
npm install express mongoose joi bcryptjs jsonwebtoken</code></pre>
          `,
          excerpt: 'Learn how to build scalable and maintainable APIs using Node.js, Express, and MongoDB with best practices for modern web development.',
          tags: ['nodejs', 'mongodb', 'api', 'backend', 'express'],
          category: 'backend-development',
          status: 'published',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          author: 'Admin User'
        }
      ];

      for (const blogData of sampleBlogs) {
        const blog = new Blog(blogData);
        await blog.save();
      }
      console.log('✅ Sample blog posts created');
    } else {
      console.log('ℹ️ Blog posts already exist');
    }

    // Create sample projects
    const existingProjects = await Project.countDocuments();
    if (existingProjects === 0) {
      const sampleProjects = [
        {
          title: 'Personal Portfolio Website',
          description: `
            A modern, responsive portfolio website built with Next.js 15, featuring a clean design, 
            blog functionality, project showcase, and contact form. The site includes admin panel 
            for content management, analytics tracking, and SEO optimization.
            
            Key features include:
            - Responsive design with Tailwind CSS
            - Blog with rich text editor
            - Project showcase with filtering
            - Contact form with email notifications
            - Admin dashboard for content management
            - Analytics and performance tracking
            - SEO optimization
          `,
          shortDescription: 'A modern, responsive portfolio website built with Next.js 15, featuring blog, projects showcase, and admin panel.',
          technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'NextAuth.js'],
          category: 'portfolio',
          status: 'completed',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(),
          featured: true,
          order: 1
        },
        {
          title: 'E-commerce Platform',
          description: `
            A full-featured e-commerce platform with modern design and comprehensive functionality.
            Built with React and Node.js, featuring user authentication, product management,
            shopping cart, payment integration, and order tracking.
            
            Features include:
            - User registration and authentication
            - Product catalog with search and filtering
            - Shopping cart and wishlist
            - Secure payment processing
            - Order management and tracking
            - Admin panel for inventory management
            - Email notifications
            - Mobile-responsive design
          `,
          shortDescription: 'A full-featured e-commerce platform with user authentication, product management, and payment integration.',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'JWT'],
          category: 'e-commerce',
          status: 'in-progress',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          featured: true,
          order: 2
        }
      ];

      for (const projectData of sampleProjects) {
        const project = new Project(projectData);
        await project.save();
      }
      console.log('✅ Sample projects created');
    } else {
      console.log('ℹ️ Projects already exist');
    }

    // Create sample testimonials
    const existingTestimonials = await Testimonial.countDocuments();
    if (existingTestimonials === 0) {
      const sampleTestimonials = [
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          company: 'Tech Solutions Inc.',
          position: 'CTO',
          content: 'Excellent work on our web application! The attention to detail and technical expertise was outstanding. Delivered on time and exceeded our expectations.',
          rating: 5,
          status: 'approved',
          featured: true,
          order: 1
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          company: 'Digital Marketing Pro',
          position: 'Marketing Director',
          content: 'Professional, reliable, and skilled developer. Created a beautiful and functional website that perfectly represents our brand. Highly recommended!',
          rating: 5,
          status: 'approved',
          featured: true,
          order: 2
        },
        {
          name: 'Mike Chen',
          email: 'mike.chen@example.com',
          company: 'StartupXYZ',
          position: 'Founder',
          content: 'Great communication throughout the project. The final product was exactly what we needed to launch our business. Thank you for the excellent work!',
          rating: 4,
          status: 'approved',
          order: 3
        }
      ];

      for (const testimonialData of sampleTestimonials) {
        const testimonial = new Testimonial(testimonialData);
        await testimonial.save();
      }
      console.log('✅ Sample testimonials created');
    } else {
      console.log('ℹ️ Testimonials already exist');
    }

    console.log('🎉 Database seeding completed successfully!');
    
    return {
      success: true,
      message: 'Database seeded successfully'
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
