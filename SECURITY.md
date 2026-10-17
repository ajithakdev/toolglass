# Security Policy
 
Toolglass is designed to operate with **zero telemetry, zero analytics, and no backend server**. For offline utilities (CSPRNG passwords, UUIDs, JWT decoding, hashes, timestamps, etc.), all computation runs 100% locally in your browser — no inputs, tokens, or cryptographic keys ever leave your machine.
 
## Supported Versions
 
We actively maintain and provide security patches for the latest version of Toolglass on the `main` branch.
 
| Version | Supported          |
| ------- | ------------------ |
| 1.0.x (main) | :white_check_mark: |
| < 1.0.0 | :x:                |
 
## Security Principles in Toolglass
 
- **CSPRNG Only:** Cryptographic operations strictly use `window.crypto.getRandomValues()` and `crypto.subtle`. We never use `Math.random()` for security-sensitive tools.
- **Zero Third-Party Telemetry:** Toolglass has no analytics trackers, tracking cookies, or diagnostic logging. In the API Tester, HTTP requests and headers are dispatched exclusively to user-specified target servers upon explicit user action, and are never intercepted or relayed through any intermediary server.
- **Client-Side Sanitization:** Rendered outputs (e.g. Markdown preview, cURL commands) use strict sanitization (`DOMPurify`, POSIX shell escaping) to prevent XSS and shell injection vulnerabilities.

## Reporting a Vulnerability

If you discover a potential security vulnerability or privacy leak within Toolglass, **please do not open a public GitHub issue.**

Instead, please report it responsibly through one of the following channels:

1. **GitHub Private Vulnerability Reporting:** Use the [Security Advisory Reporting](https://github.com/ajithakdev/toolglass/security/advisories/new) tab on this repository.
2. **Direct Email:** Contact the repository maintainer directly at **ajithakdev@gmail.com**.

### What to Include

To help us triage and resolve the issue quickly, please provide:
- A description of the vulnerability and its potential impact.
- Steps to reproduce the issue, including sample input or proof-of-concept code.
- Details regarding your environment (browser version, OS).

### Our Commitment

- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours.
- **Fix & Disclosure:** We will work promptly on a patch and coordinate a coordinated public disclosure with proper credit once the fix is deployed.
