# Portfolio Application

A modern, full-stack portfolio website built with Next.js 15, featuring a comprehensive admin dashboard, blog system, and contact management.

## Features

- 🎨 **Modern Design** - Clean, responsive UI with Tailwind CSS
- 📝 **Blog System** - Full-featured blog with admin management
- 📧 **Contact Management** - Contact form with admin dashboard
- 🔐 **Authentication** - Secure admin authentication with NextAuth.js
- 📊 **Analytics** - Google Analytics integration
- 🗄️ **Database** - MongoDB with Mongoose ODM
- 🔒 **Security** - Rate limiting, CSRF protection, input validation
- 📱 **Responsive** - Mobile-first design approach

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB Atlas
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **File Storage:** Vercel Blob
- **Email:** SendGrid
- **Analytics:** Google Analytics
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- SendGrid account (for email)
- Vercel account (for deployment)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd portfolio-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your actual values (see Environment Variables section below).

4. **Create admin user:**

   ```bash
   npm run create-admin
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Admin Access

- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Admin Login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
DATABASE_NAME=portfolio

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL=http://localhost:3000

# Admin Configuration (for scripts)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME="Admin User Name"

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=your-email@domain.com
FROM_NAME="Your Name"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=your-google-analytics-id

# External APIs (Optional)
GITHUB_TOKEN=your-github-token
GITHUB_USERNAME=your-github-username
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run create-admin` - Create admin user from environment variables
- `npm run verify-admin` - Verify admin user exists and can authenticate

## Security Features

- 🔐 **Authentication** - NextAuth.js with secure session management
- 🛡️ **Rate Limiting** - API route protection against abuse
- 🔒 **Input Validation** - Joi schema validation for all inputs
- 🚫 **CSRF Protection** - Built-in CSRF protection
- 🔑 **Password Hashing** - bcrypt with salt rounds
- 📝 **Logging** - Comprehensive request and error logging
- 🌐 **Environment Security** - Credentials stored in environment variables

## Project Structure

```
portfolio-app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── api/            # API routes
│   │   └── blog/           # Blog pages
│   ├── components/         # Reusable components
│   ├── lib/               # Utility libraries
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   └── types/            # TypeScript type definitions
├── scripts/              # Database and admin scripts
└── public/              # Static assets
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
