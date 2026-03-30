# Security Policy
## Responsible Disclosure Policy

## Supported Versions

This project is actively maintained and receives security updates for the latest stable version.

| Version | Supported |
| ------- | --------- |
| 1.0.x     | Yes       |
| < 1   | No        |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

* Send an email to: **[dhoomchhalle@gmail.com](mailto:dhoomchhalle@gmail.com)**
* Include a clear description of the issue
* Provide steps to reproduce the vulnerability
* Attach screenshots or proof-of-concept if possible

---

### What to Expect

* You will receive an acknowledgment within **48 hours**
* A detailed review will be conducted within **3–5 working days**
* If the issue is confirmed, a fix will be implemented and deployed as soon as possible
* You may be credited for responsible disclosure (optional)

---

### Please Do Not

* Do not disclose the vulnerability publicly before it is fixed
* Do not attempt to exploit the vulnerability beyond proof-of-concept
* Do not perform actions that may harm users or the system

---

## Security Measures Implemented

This project follows standard security practices to protect user data and system integrity:

### Authentication & Authorization

* **JWT-based authentication** with secure token generation and validation
* **Secure session handling** with token expiration and refresh mechanisms
* **Token blacklisting** on logout to prevent token reuse and revocation
* **Multi-layer authorization** with role-based access control (RBAC)
  - Role-based middleware: Verifies user role (admin, verifier, traveller)
  - Permission-based access: Fine-grained control with permission matrix
  - Admin-only middleware: Strict verification with suspension checks
* **Session validation** checks token validity *and* loads user from DB (handles deleted users)
* **User suspension handling** - Suspended users cannot access protected endpoints

---

### Admin Panel Security

The admin panel (`/api/v1/admin/*`) includes advanced security features:

* **Authentication Required** - All admin endpoints require valid JWT token
* **Admin Role Verification** - Endpoints verify user has 'admin' role
* **Suspension Detection** - Rejects requests from suspended admin accounts
* **Token Blacklist Check** - Prevents use of blacklisted/revoked tokens
* **[NEW] Three-Tier Authorization System:**
  - **Level 1: adminOnlyMiddleware** - Ensures strict admin verification with database checks
  - **Level 2: authorizeRole()** - Flexible role-based access factory for multiple roles
  - **Level 3: authorize()** - Permission-based access with detailed permission matrix
    - Admin permissions: 13 permissions (users, reviews, reports, settings operations)
    - Verifier permissions: 4 permissions (review moderation, analysis)
    - Traveller permissions: 2 permissions (view analytics, manage own content)

---

### Input Validation & Sanitization

* **Request validation** using express-validator and custom middleware
* **Protection against NoSQL Injection** via mongoose schema validation and sanitization
* **Sanitization of user inputs** using express-mongo-sanitize
* **Input type checking** ensures only expected data types are processed
* **Query parameter validation** prevents malicious queries

---

### Protection Against Common Attacks

* **Cross-Site Scripting (XSS) protection** via XSS library and Content Security Policy headers
* **Rate limiting** to prevent brute force attacks:
  - 100 requests per 15-minute window (applies to all routes)
  - Configurable per route for sensitive endpoints (login, registration)
* **Secure HTTP headers** using Helmet middleware:
  - X-Frame-Options (clickjacking prevention)
  - X-Content-Type-Options (MIME sniffing prevention)
  - Strict-Transport-Security (HTTPS enforcement)
  - Content-Security-Policy headers
* **CORS configuration** for controlled access - only allows whitelisted origins
* **Cookie security** - httpOnly, Secure, SameSite flags on authentication cookies

---

### File Upload Security

* **Image type validation** - Only image formats allowed (jpeg, png, webp, etc.)
* **File size restrictions** - Maximum file sizes enforced (5MB for JSON/form data)
* **Image processing and compression** using Cloudinary
* **Prevention of malicious file uploads** with file type verification
* **Secure storage** with Cloudinary CDN integration

---

### Data Security

* **Password hashing** using bcrypt with salt rounds (10+)
* **Sensitive data protection** - Passwords and sensitive fields excluded from API responses
* **Environment variables** used for secrets and API keys (never hardcoded)
* **Token expiration** - Tokens expire after configured period (typically 7 days)
* **SSL/TLS encryption** for data in transit
* **Database connection** secured with connection string authentication

---

### API Security

* **Endpoint protection** via middleware chain:
  - Authentication check (token validity)
  - Database user lookup (handles deleted accounts)
  - Role/permission verification
  - Request validation
  - Business logic execution
* **Response filtering** - Sensitive fields removed from JSON responses
* **Error handling** doesn't expose database details or system information
* **Logging** via Morgan for monitoring suspicious activity
* **Rate limiting** per IP address to prevent DoS attacks

---

### Admin-Specific Security

* **Admin-only routes** protected by authentication + admin role verification
* **User suspension tracking** - Prevented access for suspended accounts
* **Action tracking** potential for future audit logging
* **Moderation endpoints** require admin verification before processing
* **Settings protection** - System settings only modifiable by admins
* **Report management** - Secure report resolution with timestamp tracking

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│      REQUEST TO ADMIN ENDPOINT          │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   1. Auth Middleware (Token Check)      │
│      - Verify JWT exists                │
│      - Verify JWT signature             │
│      - Check token expiration           │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   2. Database Validation                │
│      - Load user from MongoDB           │
│      - Verify user exists (not deleted) │
│      - Check suspension status          │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   3. Role & Permission Verification     │
│      - Check role == 'admin'            │
│      - Verify permissions               │
│      - Custom permission matrix         │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   4. Input Validation                   │
│      - Validate request body            │
│      - Sanitize inputs                  │
│      - Type checking                    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   5. Business Logic Execution           │
│      - Execute protected operation      │
│      - Database transaction             │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   6. Response & Logging                 │
│      - Filter sensitive data            │
│      - Log action (audit trail)         │
│      - Return response                  │
└─────────────────────────────────────────┘
```

---

## Future Security Improvements

The following enhancements are planned:

* **Advanced audit logging** - Complete trail of admin actions
* **Two-factor authentication (2FA)** - Additional security for admin accounts
* **Refresh token mechanism** - Improved token lifecycle management
* **Activity monitoring** - Real-time security event notifications
* **IP whitelisting** - Restrict admin access to specific IPs
* **Session management** - Active session tracking and revoking
* **Automated vulnerability scanning** - Regular security assessments
* **Password strength enforcement** - Policies for password complexity
* **Admin action approval** - Critical operations require approval
* **Encryption at rest** - For sensitive database fields

---

## Scope

This security policy applies to:

* Web application (frontend and backend)
* APIs (user authentication and admin panel endpoints)
* Authentication systems and token management
* File upload and storage systems
* Admin role and permission validation

---

## Compliance & Standards

This project follows industry security standards:

* **OWASP Top 10** prevention measures
* **NIST Cybersecurity Framework** principles
* **JWT best practices** per RFC 7519
* **MongoDB security guidelines** for database protection
* **Express.js security recommendations**

---

## Security Testing

Developers should regularly test for:

* SQL/NoSQL Injection attacks
* XSS vulnerabilities
* CSRF attacks
* Broken authentication
* Insecure data exposure
* Security misconfiguration
* Sensitive data exposure

---

## Disclaimer

While strong security practices are implemented, no system can be guaranteed to be completely secure. Continuous improvements and updates are part of the development process. We remain committed to maintaining the highest security standards for our users.
