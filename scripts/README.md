# Admin User Management Scripts

This directory contains scripts for managing admin users in the portfolio application database.

## Scripts

### 1. `create-admin-user.js`
Creates an admin user in the database using credentials from environment variables.

**Usage:**
```bash
npm run create-admin
# or
node scripts/create-admin-user.js
```

### 2. `verify-admin-user.js`
Verifies that the admin user exists and can authenticate properly.

**Usage:**
```bash
npm run verify-admin
# or
node scripts/verify-admin-user.js
```

## Environment Variables

These scripts require the following environment variables to be set in your `.env.local` file:

```env
# Required
ADMIN_EMAIL=your-admin-email@domain.com
ADMIN_PASSWORD=your-secure-password

# Optional
ADMIN_NAME="Your Admin Name"

# Database (also required)
MONGODB_URI=your-mongodb-connection-string
DATABASE_NAME=portfolio
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit credentials to version control**
   - The `.env.local` file is already in `.gitignore`
   - Use `.env.example` as a template for required variables

2. **Use strong passwords**
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers, and special characters

3. **Environment-specific credentials**
   - Use different credentials for development, staging, and production
   - Never use development credentials in production

4. **Secure storage**
   - Store production credentials in secure environment variable services
   - Consider using services like Vercel Environment Variables, AWS Secrets Manager, etc.

## Example Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the admin credentials in `.env.local`:
   ```env
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ADMIN_NAME="Your Name"
   ```

3. Run the create admin script:
   ```bash
   npm run create-admin
   ```

4. Verify the admin user was created:
   ```bash
   npm run verify-admin
   ```

## Troubleshooting

### Common Issues

1. **"Admin credentials not found in environment variables"**
   - Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env.local`
   - Check that the `.env.local` file is in the project root

2. **"Cannot find module 'dotenv'"**
   - Install the dotenv package: `npm install dotenv`

3. **Database connection errors**
   - Verify `MONGODB_URI` is correct
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Check network connectivity

4. **"User already exists"**
   - This is normal if the admin user was already created
   - The script will update the existing user to admin role if needed

## Script Features

### Create Admin Script
- ✅ Checks if user already exists
- ✅ Updates existing user to admin role if needed
- ✅ Hashes passwords securely using bcrypt
- ✅ Validates credentials after creation
- ✅ Provides detailed logging

### Verify Admin Script
- ✅ Finds admin user by email
- ✅ Tests password authentication
- ✅ Verifies admin privileges
- ✅ Lists all users in database
- ✅ Provides comprehensive status report
