# Admin System Testing Guide

## 🚀 **Quick Start**
```bash
cd portfolio-app
npm run dev
```
Visit: http://localhost:3001/admin

## 🔐 **Admin Login**
Use your configured admin credentials from the environment variables:
- Email: `ADMIN_EMAIL` from .env.local
- Password: `ADMIN_PASSWORD` from .env.local

## 📋 **Testing Checklist**

### ✅ **1. Dashboard**
- [ ] Visit `/admin` - should show dashboard with statistics
- [ ] Verify all stat cards display correctly
- [ ] Check that navigation sidebar works

### ✅ **2. Projects Management** (`/admin/projects`)
- [ ] Page loads without errors
- [ ] Search functionality works
- [ ] Status filtering works
- [ ] Pagination displays (if you have projects)
- [ ] "New Project" button is visible

**Test API directly:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/projects
```

### ✅ **3. Testimonials Management** (`/admin/testimonials`)
- [ ] Page loads without errors
- [ ] Grid layout displays correctly
- [ ] Search and filtering work
- [ ] Approve/Reject buttons are functional (when testimonials exist)

**Test API directly:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/testimonials
```

### ✅ **4. Analytics Dashboard** (`/admin/analytics`)
- [ ] Page loads without errors
- [ ] Period selector works (7d, 30d, 90d, 1y)
- [ ] Statistics cards display
- [ ] Top pages/referrers sections show
- [ ] Device/browser stats display

**Test API directly:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/analytics?period=30d
```

### ✅ **5. Media Management** (`/admin/media`)
- [ ] Page loads without errors
- [ ] File upload area is visible
- [ ] Drag & drop zone works
- [ ] File type tabs work (All, Images, Documents, Others)

**Test file upload:**
- Try uploading an image file
- Try uploading a PDF document
- Verify files appear in the correct categories

### ✅ **6. Settings Management** (`/admin/settings`)
- [ ] Page loads without errors
- [ ] Tabbed interface works
- [ ] General settings form is functional
- [ ] Form validation works
- [ ] Save functionality works

**Test settings API:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/settings
```

## 🧪 **Advanced Testing**

### **1. Create Test Data**
You can create test testimonials via API:
```bash
curl -X POST http://localhost:3001/api/testimonials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "company": "Tech Corp",
    "position": "CEO",
    "content": "Excellent work on our project!",
    "rating": 5,
    "status": "pending"
  }'
```

### **2. Test Analytics Tracking**
```bash
curl -X POST http://localhost:3001/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "page": "/",
    "sessionId": "test-session-123"
  }'
```

### **3. Test Settings Update**
```bash
curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "siteName": "My Updated Portfolio",
    "siteDescription": "Updated description"
  }'
```

## 🔍 **Debugging**

### **Check Logs**
Monitor the terminal for detailed logs:
- Database operations
- Authentication events
- Admin actions
- Performance metrics

### **Common Issues**
1. **Authentication Errors**: Check NextAuth.js configuration
2. **Database Errors**: Verify MongoDB connection string
3. **File Upload Errors**: Check Vercel Blob configuration
4. **Validation Errors**: Check Joi schemas

### **Environment Variables**
Ensure these are set in `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=portfolio
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 📊 **Performance Monitoring**

The system includes built-in performance monitoring:
- Slow database operations (>1s) are logged as warnings
- Admin dashboard load times are tracked
- All API response times are logged

Watch for these in the terminal output.

## 🎯 **Success Criteria**
- [ ] All admin pages load without errors
- [ ] All API endpoints return 200 status codes
- [ ] Authentication and authorization work correctly
- [ ] Database operations complete successfully
- [ ] File uploads work (if Vercel Blob is configured)
- [ ] Settings can be updated and saved
- [ ] Comprehensive logging is visible in terminal

## 🚀 **Production Deployment**
Before deploying to production:
1. Update environment variables for production
2. Test with production database
3. Verify Vercel Blob configuration
4. Test email functionality (if using SendGrid)
5. Enable proper logging levels
6. Set up monitoring and alerts

## 📞 **Support**
If you encounter any issues:
1. Check the terminal logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from your IP
4. Check that all required dependencies are installed
