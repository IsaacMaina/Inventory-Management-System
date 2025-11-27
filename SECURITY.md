# Security Implementation for IMS Application

This document outlines the security measures implemented in the Inventory Management System (IMS) application.

## Authentication & Authorization

### NextAuth.js Configuration
- Implemented secure authentication using NextAuth.js with JWT strategy
- Session tokens have a 24-hour expiration for security
- CSRF protection is enabled
- Secure session handling with proper token storage

### Role-Based Access Control (RBAC)
The system implements a role-based access control system with the following roles:

- **ADMIN**: Full access to all system features
- **MANAGER**: Access to inventory management, reports, and analytics
- **USER**: Read-only access to products and categories
- **VIEWER**: Limited read-only access to basic information

### Permission System
The following permissions are defined and enforced:

- `PRODUCT_READ`: Access to read product information
- `PRODUCT_CREATE`: Ability to create new products
- `PRODUCT_UPDATE`: Ability to update existing products
- `PRODUCT_DELETE`: Ability to delete products
- `CATEGORY_READ`: Access to read category information
- `CATEGORY_CREATE`: Ability to create new categories
- `ANALYTICS_READ`: Access to analytics and reports
- `REPORTS_READ`: Access to reports
- `SETTINGS_UPDATE`: Administrative settings access

## API Security

### Server Actions
All server actions enforce proper authorization:

1. **Category Actions** (`src/actions/categoryActions.ts`):
   - `getCategoriesWithHierarchy`: Requires `CATEGORY_READ` permission
   - `createCategory`: Requires `CATEGORY_CREATE` permission
   - `getProducts`: Requires `PRODUCT_READ` permission with user-specific filtering
   - `createProduct`: Requires `PRODUCT_CREATE` permission
   - `updateProduct`: Requires `PRODUCT_UPDATE` permission and ownership check
   - `deleteProduct`: Requires `PRODUCT_DELETE` permission and ownership check

2. **Analytics Actions** (`src/lib/actions/analytics.ts`):
   - `getAnalyticsData`: Requires `ANALYTICS_READ` permission

3. **Dashboard Actions** (`src/lib/actions/dashboard.ts`):
   - `getDashboardData`: Requires `PRODUCT_READ` permission with user-specific data filtering

4. **Reports Actions** (`src/lib/actions/reports.ts`):
   - `getReports`: Requires `REPORTS_READ` permission with user-specific filtering

5. **Settings Actions** (`src/lib/actions/settings.ts`):
   - Profile and password updates restricted to authenticated users

### API Routes
API routes include proper authentication and authorization:

1. **Analytics API** (`src/app/api/analytics/route.ts`):
   - Requires authentication and `ANALYTICS_READ` permission

2. **Upload API** (`src/app/api/upload/product-image/route.ts`):
   - Requires authentication before processing file uploads
   - Implements secure file upload with validation

3. **Auth Callback API** (`src/app/api/auth/callback/route.ts`):
   - Implements rate limiting to prevent brute force attacks
   - Uses secure password hashing with bcrypt
   - Includes password compromise checking

## Input Validation & Sanitization

- All user inputs are validated using Zod schemas
- Email addresses are sanitized and validated
- Password strength requirements enforced (min 8 chars, upper/lower/digit)
- SQL injection prevention through Prisma ORM parameterized queries
- XSS prevention through Next.js automatic escaping

## File Upload Security

- File type validation using MIME type checking
- File size limitations enforced
- Secure file naming to prevent path traversal
- Files stored securely with access controls

## Rate Limiting

- Authentication rate limiting to prevent brute force attacks
- Configurable limits based on IP address and email

## Error Handling

- Generic error messages to prevent information disclosure
- Detailed error logging for debugging without exposing internals to users
- Proper error boundaries to handle unexpected issues gracefully

## Security Headers

The application implements the following security headers:

- Content Security Policy (CSP)
- X-Frame-Options for clickjacking protection
- X-Content-Type-Options to prevent MIME-type sniffing
- Strict Transport Security (HSTS)
- Referrer Policy

## Data Protection

- Passwords are hashed using bcrypt with salt rounds
- Sensitive data is not exposed in client-side code
- User-specific data filtering ensures users can only access their own data (unless admin)
- Session management with secure token handling