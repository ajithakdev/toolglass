<div align="center">

# ✦ Toolglass

**Frosted developer utilities — beautifully fast, 100% client-side.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blueviolet.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-149eca.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![CI/CD](https://github.com/ajithakdev/toolglass/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ajithakdev/toolglass/actions/workflows/ci-cd.yml)

🔗 **Try it live:** [toolglass.ajithakdev.com](https://toolglass.ajithakdev.com/)

</div>

---

We built Toolglass because we were tired of opening ad-riddled websites just to decode a JWT, test a regex, or format a timestamp. Most online utility sites leak your sensitive data to backend servers or track your keystrokes.

Toolglass is a zero-telemetry, offline-first suite of developer tools running entirely inside your browser. No backend. No cookies. No analytics. When you paste an API secret or inspect a token, it never touches the network.

---

## 🧰 Available Tools

| Category | Tools |
|---|---|
| **Generators** | • [Password Generator](https://toolglass.ajithakdev.com/tools/password) (CSPRNG, rejection-sampled, entropy meter, bulk up to 100 with .txt download)<br>• [UUID](https://toolglass.ajithakdev.com/tools/uuid) (bulk v4 and time-sorted v7 per RFC 9562, plus an inspector that decodes version and v7 timestamp)<br>• [NanoID](https://toolglass.ajithakdev.com/tools/nanoid) (URL-safe compact IDs)<br>• [Mongo ObjectId](https://toolglass.ajithakdev.com/tools/objectid) (24-char BSON IDs with embedded timestamp)<br>• [QR Code](https://toolglass.ajithakdev.com/tools/qr) (Instant canvas/SVG generation & PNG download) |
| **Encoders & Decoders** | • [Base64](https://toolglass.ajithakdev.com/tools/base64) (Unicode-safe encode/decode)<br>• [URL Encoder](https://toolglass.ajithakdev.com/tools/url) (`encodeURIComponent`, with a batch mode for one URL per line)<br>• [JWT Decoder](https://toolglass.ajithakdev.com/tools/jwt-decode) (Header/payload breakdown & expiration badges) |
| **Converters & Formatters** | • [JSON Formatter](https://toolglass.ajithakdev.com/tools/json) (Beautify, minify, line and column errors, JSON Schema validation)<br>• [Color Converter](https://toolglass.ajithakdev.com/tools/color) (Hex ⇄ RGB ⇄ HSL with live alpha slider)<br>• [JSON to TypeScript](https://toolglass.ajithakdev.com/tools/json-to-ts) (Generates interfaces or types automatically) |
| **Security & Crypto** | • [Hash Generator](https://toolglass.ajithakdev.com/tools/hash) (text or files: SHA-1, SHA-2, SHA-3, and Keccak-256)<br>• [JWT Signer](https://toolglass.ajithakdev.com/tools/jwt) (HS256, RS256, ES256 signing and key pair generation) |
| **Everyday** | • [Word Counter](https://toolglass.ajithakdev.com/tools/word-counter) (words, characters, reading time, any language)<br>• [Text Diff](https://toolglass.ajithakdev.com/tools/text-diff) (line-by-line compare)<br>• [Notepad](https://toolglass.ajithakdev.com/tools/notepad) (autosaves in your browser)<br>• [Unit Converter](https://toolglass.ajithakdev.com/tools/unit-converter) (length, mass, temperature, storage, and more)<br>• [Percentage Calculator](https://toolglass.ajithakdev.com/tools/percentage) (percent of, percent change, add or remove)<br>• [World Clock](https://toolglass.ajithakdev.com/tools/world-clock) (time zones side by side)<br>• [Stopwatch & Timer](https://toolglass.ajithakdev.com/tools/timer) (laps, countdown, pomodoro) |
| **Images & Media** | • [Image Compressor](https://toolglass.ajithakdev.com/tools/image-compress) (WebP, JPEG, PNG, AVIF, resize, strips EXIF)<br>• [Screen Recorder](https://toolglass.ajithakdev.com/tools/screen-recorder) (screen, window, or tab, optional mic) |
| **API & Networking** | • [API Tester](https://toolglass.ajithakdev.com/tools/api-tester) (In-browser HTTP client with cURL import and sanitized headers) |
| **Utilities** | • [Timestamp Converter](https://toolglass.ajithakdev.com/tools/timestamp) (Unix epoch ⇄ ISO 8601 ⇄ relative time & batch mode)<br>• [Regex Tester](https://toolglass.ajithakdev.com/tools/regex) (Real-time regex engine with visual match highlights)<br>• [Markdown Preview](https://toolglass.ajithakdev.com/tools/markdown) (Live GitHub-flavored preview with DOMPurify sanitization) |

---

## 💡 Key Principles

1. **Zero Network Calls:** Apart from requests you send yourself in the API Tester, everything executes on the client thread using standard Web APIs (`crypto.subtle`, `crypto.getRandomValues`, `DOMParser`).
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
│   ├── catalog.ts       # Tool metadata: titles, categories, keywords
│   ├── registry.tsx     # Icons and lazy-loaded components per tool
│   └── <tool-name>/
│       ├── <Tool>Tool.tsx      # Main React UI component
│       ├── <tool>.ts           # Pure business logic / calculations
│       └── <tool>.test.ts(x)   # Unit and component tests
└── App.tsx              # Shell with global navigation and theme providers
```

---

## 🤝 Contributing

We love contributions! Toolglass was built to make contributing new utilities frictionless:

- Adding a new tool usually takes **one self-contained folder** under `src/tools/`, an entry in `src/tools/catalog.ts`, and its icon and component in `src/tools/registry.tsx`.
- We maintain a **zero external runtime dependencies** rule for individual tools — rely on native browser APIs.
- Check out our **[Contributing Guide](.github/CONTRIBUTING.md)** for detailed step-by-step instructions.
- All contributors are expected to follow our **[Code of Conduct](CODE_OF_CONDUCT.md)**.
- See our **[Security Policy](SECURITY.md)** for responsible vulnerability disclosure.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built with ✦ by [ajithakdev](https://github.com/ajithakdev).
