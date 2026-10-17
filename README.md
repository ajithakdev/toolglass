<div align="center">

# ✦ Toolglass

**Frosted developer utilities — beautifully fast, 100% client-side.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blueviolet.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-149eca.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![CI/CD](https://github.com/ajithakdev/toolglass/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ajithakdev/toolglass/actions/workflows/ci-cd.yml)

🔗 **Try it live:** [ajithakdev.github.io/toolglass](https://ajithakdev.github.io/toolglass/)

</div>

---

We built Toolglass because we were tired of opening ad-riddled websites just to decode a JWT, test a regex, or format a timestamp. Most online utility sites leak your sensitive data to backend servers or track your keystrokes.

Toolglass is a zero-telemetry, offline-first suite of developer tools running entirely inside your browser. No backend. No cookies. No analytics. When you paste an API secret or inspect a token, it never touches the network.

---

## 🧰 Available Tools

| Category | Tools |
|---|---|
| **Generators** | • [Password Generator](https://ajithakdev.github.io/toolglass/#/tools/password) (CSPRNG, rejection-sampled, entropy meter)<br>• [UUID v4](https://ajithakdev.github.io/toolglass/#/tools/uuid) (RFC 4122 bulk generation)<br>• [NanoID](https://ajithakdev.github.io/toolglass/#/tools/nanoid) (URL-safe compact IDs)<br>• [Mongo ObjectId](https://ajithakdev.github.io/toolglass/#/tools/objectid) (24-char BSON IDs with embedded timestamp)<br>• [QR Code](https://ajithakdev.github.io/toolglass/#/tools/qr) (Instant canvas/SVG generation & PNG download) |
| **Encoders & Decoders** | • [Base64](https://ajithakdev.github.io/toolglass/#/tools/base64) (Unicode-safe encode/decode)<br>• [URL Encoder](https://ajithakdev.github.io/toolglass/#/tools/url) (`encodeURIComponent` with full parameter parsing)<br>• [JWT Decoder](https://ajithakdev.github.io/toolglass/#/tools/jwt-decode) (Header/payload breakdown & expiration badges) |
| **Converters & Formatters** | • [JSON Formatter](https://ajithakdev.github.io/toolglass/#/tools/json) (Beautify, minify, syntax validation with line errors)<br>• [Color Converter](https://ajithakdev.github.io/toolglass/#/tools/color) (Hex ⇄ RGB ⇄ HSL with live alpha slider)<br>• [JSON to TypeScript](https://ajithakdev.github.io/toolglass/#/tools/json-to-ts) (Generates interfaces or types automatically) |
| **Security & Crypto** | • [Hash Generator](https://ajithakdev.github.io/toolglass/#/tools/hash) (SHA-1, SHA-256, SHA-384, SHA-512 via Web Crypto)<br>• [JWT Signer](https://ajithakdev.github.io/toolglass/#/tools/jwt) (Local HMAC-SHA256 signature generation) |
| **API & Networking** | • [API Tester](https://ajithakdev.github.io/toolglass/#/tools/api-tester) (In-browser HTTP client with cURL import and sanitized headers) |
| **Utilities** | • [Timestamp Converter](https://ajithakdev.github.io/toolglass/#/tools/timestamp) (Unix epoch ⇄ ISO 8601 ⇄ relative time & batch mode)<br>• [Regex Tester](https://ajithakdev.github.io/toolglass/#/tools/regex) (Real-time regex engine with visual match highlights)<br>• [Markdown Preview](https://ajithakdev.github.io/toolglass/#/tools/markdown) (Live GitHub-flavored preview with DOMPurify sanitization) |

---

## 💡 Key Principles

1. **Zero Network Calls:** Everything executes on the client thread using standard Web APIs (`crypto.subtle`, `crypto.getRandomValues`, `DOMParser`).
2. **Cryptographic Rigor:** Randomness is strictly backed by CSPRNG with rejection sampling to eliminate modulo bias. We never use `Math.random()`.
3. **Instant Keyboard Navigation:** Hit `⌘K` or `Ctrl+K` anywhere to open the command palette and jump between tools without taking your hands off the keyboard.
4. **Shareable State:** Key tool configurations sync to URL query params (debounced) so you can bookmark or share exact settings with teammates.
5. **No Bloat:** Every tool is code-split via dynamic `React.lazy()` imports. The initial load is tiny (~130 KB gzipped) and tools load on demand.

---

## 🛠️ Local Development

Toolglass uses standard modern frontend tooling (React 19, TypeScript, Vite, Vitest):

```bash
# Clone the repository
git clone https://github.com/ajithakdev/toolglass.git
cd toolglass

# Install dependencies
npm install

# Start local dev server with HMR
npm run dev
```

### Common Scripts

```bash
npm run dev            # Start local dev server at http://localhost:5173
npm run build          # Strict type-check (tsc -b) followed by production Vite build
npm run preview        # Preview production bundle locally
npm run lint           # Run ESLint across code and tests
npm test               # Run Vitest test suite once
npm run test:coverage  # Generate test coverage report
```

---

## 🗂️ Project Structure

```
src/
├── components/          # Reusable glass UI widgets (Buttons, Inputs, CommandPalette)
├── hooks/               # Custom hooks (useClipboard, useTheme, useUrlState)
├── pages/
│   ├── Landing.tsx      # Main dashboard with categorized tool grid
│   ├── ToolPage.tsx     # Dynamic lazy loader with ErrorBoundary & Suspense
│   └── NotFound.tsx     # Custom 404 page
├── tools/               # Self-contained tool modules
│   ├── registry.tsx     # Single source of truth for tool metadata & routing
│   └── <tool-name>/
│       ├── <Tool>Tool.tsx      # Main React UI component
│       ├── <tool>.ts           # Pure business logic / calculations
│       └── <tool>.test.ts(x)   # Unit and component tests
└── App.tsx              # Shell with global navigation and theme providers
```

---

## 🤝 Contributing

We love contributions! Toolglass was built to make contributing new utilities frictionless:

- Adding a new tool usually requires just **one self-contained folder** under `src/tools/` and a registration line in `src/tools/registry.tsx`.
- We maintain a **zero external runtime dependencies** rule for individual tools — rely on native browser APIs.
- Check out our **[Contributing Guide](.github/CONTRIBUTING.md)** for detailed step-by-step instructions.
- All contributors are expected to follow our **[Code of Conduct](CODE_OF_CONDUCT.md)**.
- See our **[Security Policy](SECURITY.md)** for responsible vulnerability disclosure.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built with ✦ by [ajithakdev](https://github.com/ajithakdev).
