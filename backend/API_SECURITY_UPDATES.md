# API Security Updates & Documentation

## Password Requirements

All new passwords must meet these security requirements:

✅ **Minimum 8 characters**
✅ **1 Uppercase letter** (A-Z)
✅ **1 Lowercase letter** (a-z)
✅ **1 Number** (0-9)
✅ **1 Special character** (!@#$%^&*()_+-=[]{}';:"\\|,.<>/?`~)

### Examples of Valid Passwords
- `MyPassword123!`
- `Secure@Pass2024`
- `Admin#Secure123`

### Examples of Invalid Passwords
- `password123` ❌ (no uppercase, no special char)
- `Password123` ❌ (no special character)
- `Pass@1` ❌ (too short)
- `PASSWORD123!` ❌ (no lowercase)

---

## API Changes & Fixes

### 1. **Registration Endpoint**
**Endpoint:** `POST /users/register`

**Changes:**
- Now validates password strength
- Validates email format
- Validates phone format (10 digits)
- Validates name length (2-100 characters)
- Rate limited: 3 registrations per hour per IP

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass@123"
}
```

**Response on Password Error:**
```json
{
  "success": false,
  "message": "Password does not meet security requirements.",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one special character"
  ]
}
```

---

### 2. **Login Endpoint**
**Endpoint:** `POST /users/login`

**Changes:**
- Rate limited: 5 login attempts per 15 minutes per IP
- Account auto-locked after 5 failed attempts
- User notified via email when blocked
- Improved JWT token with version tracking

---

### 3. **Change Password Endpoint**
**Endpoint:** `POST /users/profile/change-password`

**Changes:**
- Now validates new password strength
- Requires current password for verification
- Uses stronger bcrypt (12 rounds)

**Request:**
```json
{
  "current_password": "OldPass@123",
  "new_password": "NewSecure@Pass123"
}
```

---

### 4. **File Upload Endpoints**

#### Product Image Upload
**Endpoint:** `POST /products/create` (with `product_image`)

**Allowed:**
- MIME Types: image/jpeg, image/png, image/gif, image/webp
- Extensions: jpg, jpeg, png, gif, webp
- Max Size: 5MB

**Validation Error:**
```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp"
}
```

#### Product Gallery Upload
**Endpoint:** `POST /products/gallery/add`

**Same restrictions as product image**

#### User Profile Photo
**Endpoint:** `PUT /users/profile` (with `photo`)

**Same restrictions as product image**

---

## Session Security

### Session Configuration
- **Timeout:** 2 hours (reduced from 8)
- **Secure Cookie:** HTTPS only in production
- **HttpOnly:** Cannot be accessed via JavaScript
- **SameSite:** Strict (prevents CSRF)
- **Session Regeneration:** After successful login

### Session Expiration
Sessions are automatically terminated after:
- 2 hours of inactivity
- User logout
- Admin forced logout

---

## Rate Limiting

### Applied Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Register | 3 registrations | 1 hour |
| Password Reset | 3 requests | 1 hour |
| General API | 100 requests | 15 minutes |

### Error Response
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later.",
  "retryAfter": 900
}
```

---

## File Upload Security

### Validation Process

1. **MIME Type Check:** Verifies Content-Type header
2. **Extension Check:** Validates against allowed extensions
3. **Size Check:** Ensures file doesn't exceed limits
4. **Null Byte Check:** Detects malicious filenames
5. **Safe Filename:** Generates secure filename to prevent path traversal

### Filename Example
```
Before:  "../../etc/passwd.jpg"
After:   "1709123456_a7b9c2d3_etc_passwd.jpg"
```

---

## Security Headers

All responses now include these security headers:

```
X-Frame-Options: DENY
  → Prevents clickjacking attacks

X-Content-Type-Options: nosniff
  → Prevents MIME sniffing attacks

X-XSS-Protection: 1; mode=block
  → Enables XSS protection in browsers

Content-Security-Policy: default-src 'self'; ...
  → Controls which resources can be loaded

Referrer-Policy: strict-origin-when-cross-origin
  → Controls referrer information

Permissions-Policy: geolocation=(), microphone=(), camera=()
  → Disables unnecessary API permissions
```

---

## Input Sanitization

### What Gets Sanitized
- All request body parameters
- HTML special characters
- Potential XSS payloads

### Example
```
Input:  <script>alert('xss')</script>
Output: &lt;script&gt;alert(&apos;xss&apos;)&lt;&#x2F;script&gt;
```

---

## Authentication Token Format

### JWT Token
```json
{
  "id": 123,
  "email": "user@example.com",
  "role": "user",
  "version": 0,
  "iat": 1709123456,
  "exp": 1709156456
}
```

### Token Invalidation
- Tokens are invalidated if user's `token_version` changes
- Password change increments token version
- Admin can force logout by incrementing version

---

## Migration Guide for Frontend

### 1. Password Validation
Update password input UI to enforce:
- Minimum 8 characters
- Show strength indicator
- Display validation messages

### 2. Error Handling
Handle new error responses:
```javascript
// Example: Password validation error
{
  "success": false,
  "message": "Password does not meet security requirements.",
  "errors": [...]
}
```

### 3. Rate Limiting
Handle 429 status code:
```javascript
if (response.status === 429) {
  // Show "too many attempts" message
  // Disable button for X seconds
}
```

### 4. JWT Token Version
Check for token invalidation errors:
```javascript
if (error.message === 'Token has been invalidated') {
  // Force logout and redirect to login
}
```

---

## Environment Variables Required

```bash
# Session Secret (min 32 chars)
SESSION_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Secret (min 32 chars)
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=xxxxxxxx
DB_NAME=database_name

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@company.com

# Environment
NODE_ENV=production  # Set to 'production' for deployment
PORT=3001
```

---

## Testing Checklist

- [ ] Register with weak password - should be rejected
- [ ] Register with valid password - should succeed
- [ ] Login with correct credentials - should succeed
- [ ] Login 5 times with wrong password - account should be locked
- [ ] Upload JPG image - should succeed
- [ ] Upload PDF file - should be rejected
- [ ] Upload 10MB image - should be rejected
- [ ] Change password with weak new password - should be rejected
- [ ] Verify session expires after 2 hours

---

## Support & Troubleshooting

### JWT_SECRET Not Defined
**Error:** `JWT_SECRET is not defined in .env`
**Solution:** Add to .env:
```bash
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### Session Secret Not Defined
**Error:** `SESSION_SECRET is not defined in .env`
**Solution:** Add to .env:
```bash
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### Too Many Login Attempts
**Error:** `403 - Account blocked due to multiple failed login attempts`
**Solution:** Admin needs to unblock user from user management panel

### File Upload Fails
**Issue:** File upload gets rejected
**Check:** 
- File type is allowed
- File size is under limit
- File extension matches MIME type

---

**Last Updated:** 2024
**Version:** Security Audit Complete
