# Portfolio Admin API Documentation

## 🔐 **Authentication**
All admin endpoints require authentication via NextAuth.js session with admin role.

## 📊 **Response Format**
All API responses follow this standard format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "pagination": {...} // For paginated endpoints
}
```

## 🗂️ **API Endpoints**

### **Testimonials API**

#### `GET /api/testimonials`
Fetch testimonials with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in name, company, content
- `status` (string): Filter by status (pending, approved, rejected)
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc, desc, default: desc)

**Response:**
```json
{
  "success": true,
  "message": "Testimonials retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "company": "Tech Corp",
      "position": "CEO",
      "content": "Excellent work!",
      "rating": 5,
      "status": "approved",
      "avatar": "https://...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### `POST /api/testimonials` (Admin Only)
Create a new testimonial.

**Request Body:**
```json
{
  "name": "John Doe",
  "company": "Tech Corp",
  "position": "CEO",
  "content": "Excellent work on our project!",
  "rating": 5,
  "status": "pending",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### `PUT /api/testimonials/[id]` (Admin Only)
Update a testimonial.

#### `DELETE /api/testimonials/[id]` (Admin Only)
Delete a testimonial.

### **Analytics API**

#### `GET /api/analytics` (Admin Only)
Get analytics data with aggregations.

**Query Parameters:**
- `period` (string): Time period (7d, 30d, 90d, 1y)
- `startDate` (string): Custom start date (ISO format)
- `endDate` (string): Custom end date (ISO format)
- `type` (string): Filter by event type
- `page` (string): Filter by specific page

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalEvents": 1250,
      "uniqueVisitors": 450,
      "pageViews": 890,
      "bounceRate": 35.5
    },
    "topPages": [
      { "page": "/", "views": 245 },
      { "page": "/about", "views": 123 }
    ],
    "topReferrers": [
      { "referrer": "google.com", "visits": 89 }
    ],
    "deviceStats": [
      { "device": "desktop", "count": 567 }
    ],
    "browserStats": [
      { "browser": "chrome", "count": 678 }
    ],
    "dailyStats": [
      {
        "date": "2024-01-01",
        "pageViews": 45,
        "uniqueVisitors": 23,
        "totalEvents": 67
      }
    ]
  }
}
```

#### `POST /api/analytics`
Track an analytics event.

**Request Body:**
```json
{
  "eventType": "page_view",
  "page": "/about",
  "referrer": "https://google.com",
  "sessionId": "session-123",
  "userId": "user-456",
  "metadata": {
    "source": "organic"
  }
}
```

### **Media API**

#### `GET /api/media` (Admin Only)
List uploaded media files.

**Query Parameters:**
- `cursor` (string): Pagination cursor
- `limit` (number): Items per page (default: 20)
- `prefix` (string): Filter by file prefix/folder

**Response:**
```json
{
  "success": true,
  "data": {
    "files": {
      "images": [...],
      "documents": [...],
      "others": [...]
    },
    "allFiles": [...],
    "stats": {
      "total": 45,
      "images": 23,
      "documents": 12,
      "others": 10
    }
  }
}
```

#### `POST /api/media` (Admin Only)
Upload a new file.

**Request:** Multipart form data
- `file` (File): The file to upload
- `folder` (string): Target folder (optional)
- `description` (string): File description (optional)

#### `DELETE /api/media` (Admin Only)
Delete a file.

**Query Parameters:**
- `url` (string): File URL to delete

### **Settings API**

#### `GET /api/settings`
Get site settings (creates defaults if none exist).

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "siteName": "Portfolio Website",
      "siteDescription": "Professional portfolio",
      "siteUrl": "https://example.com",
      "contactEmail": "admin@example.com",
      "socialMedia": {
        "github": "https://github.com/username",
        "linkedin": "https://linkedin.com/in/username"
      },
      "seo": {
        "metaTitle": "Portfolio",
        "metaDescription": "My portfolio",
        "keywords": ["portfolio", "developer"]
      },
      "features": {
        "blogEnabled": true,
        "projectsEnabled": true,
        "testimonialsEnabled": true
      }
    }
  }
}
```

#### `PUT /api/settings` (Admin Only)
Update site settings.

**Request Body:** Partial settings object

#### `POST /api/settings/reset` (Admin Only)
Reset settings to default values.

## 🔍 **Error Responses**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 📝 **Validation**
All endpoints use Joi validation schemas:
- Input validation with detailed error messages
- Type checking and format validation
- Required field validation
- Custom validation rules (URLs, emails, etc.)

## 🔒 **Security Features**
- NextAuth.js session-based authentication
- Role-based access control (admin role required)
- CSRF protection
- Rate limiting ready
- Input sanitization
- SQL injection prevention (NoSQL)

## 📊 **Logging**
All API operations are logged with:
- Performance metrics
- Database operation times
- Admin action tracking
- Error logging with stack traces
- Request/response logging

## 🚀 **Performance**
- Database query optimization
- Pagination for large datasets
- Efficient aggregation pipelines
- Response caching headers
- Compressed responses
