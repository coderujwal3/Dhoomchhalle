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

* Send an email to: **[dhoomchhalle@gmail.com](mailto:your-email@example.com)**
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

* JWT-based authentication
* Secure session handling
* Token expiration and validation
* Role-based access control (planned)

---

### Input Validation & Sanitization

* Request validation using middleware
* Protection against NoSQL Injection
* Sanitization of user inputs

---

### Protection Against Common Attacks

* Cross-Site Scripting (XSS) protection
* Rate limiting to prevent brute force attacks
* Secure HTTP headers using Helmet
* CORS configuration for controlled access

---

### File Upload Security

* Image type validation (only image formats allowed)
* File size restrictions
* Image processing and compression using Cloudinary
* Prevention of malicious file uploads

---

### Data Security

* Password hashing using bcrypt
* Sensitive data is not exposed in API responses
* Environment variables used for secrets and API keys

---

## Future Security Improvements

The following enhancements are planned:

* Refresh token mechanism
* Advanced session management
* Activity logging and monitoring
* Two-factor authentication (2FA)
* Automated vulnerability scanning

---

## Scope

This security policy applies to:

* Web application (frontend and backend)
* APIs and authentication systems
* File upload and storage systems

---

## Disclaimer

While strong security practices are implemented, no system can be guaranteed to be completely secure. Continuous improvements and updates are part of the development process.
