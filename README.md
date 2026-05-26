<div align="center">

# ✦ Toolglass

**Frosted developer utilities — beautifully fast, 100% client-side.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blueviolet.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-149eca.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev)

🔗 **Live:** https://ajithakdev.github.io/password-generator-v1/

</div>

---

Toolglass bundles nine of the utilities you reach for every day into a single glassmorphic, pastel-gradient interface. No backend. No analytics. No data ever leaves your browser.

## 🧰 Tools

| | Tool | What it does |
|---|---|---|
| 🔐 | **Password Generator** | CSPRNG passwords, rejection-sampled, strength meter (bits of entropy) |
| 🪪 | **JWT Generator** | Sign HS256 JSON Web Tokens with custom header / payload / secret |
| 🆔 | **UUID v4** | Bulk RFC 4122 v4 UUIDs |
| 🍃 | **Mongo ObjectId** | 24-char BSON ObjectIds (timestamp + machine + counter) |
| ⚡ | **NanoID** | URL-safe compact IDs with configurable alphabet & length |
| #️⃣ | **Hash Generator** | SHA-1 / 256 / 384 / 512 via Web Crypto |
| 🧬 | **Base64** | Unicode-safe encode / decode |
| ⏱️ | **Timestamp** | Unix ⇄ ISO ⇄ local time |
| `{}` | **JSON Formatter** | Beautify, minify, validate with error positions |

## ✨ Highlights

- **Cryptographically strong** — every random byte uses `crypto.getRandomValues` / `crypto.subtle`. Never `Math.random`.
- **Modular** — tools live in self-contained folders; a single `registry.ts` drives routes + landing cards.
- **Tiny** — each tool is lazy-loaded, ~1–3 KB gzipped per tool.
- **Accessible** — semantic markup, keyboard-focusable, aria-live toasts, respects `prefers-reduced-motion`.
- **Pretty** — glassmorphism, pastel gradients, framer-motion micro-interactions.

## 🧱 Stack

- **React 18** + **TypeScript 5**
- **Vite 5** (fast HMR, ES2022 output)
- **react-router-dom** (HashRouter — GH Pages friendly)
- **framer-motion**
- **Web Crypto API**

## 🚀 Quick start

```bash
git clone https://github.com/ajithakdev/password-generator-v1.git toolglass
cd toolglass
npm install
npm run dev
```

Requires Node 20+.

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server with HMR |
| `npm run build` | Type-check + production build (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run deploy` | Build & publish to `gh-pages` |

## 🗂️ Architecture

```
src/
├─ main.tsx              # entry + HashRouter
├─ App.tsx               # shell, nav, routes
├─ index.css             # tokens, theme, glass utilities
├─ lib/                  # framework-free helpers (cn, …)
├─ hooks/                # reusable hooks (useClipboard, …)
├─ components/
│  ├─ ToolLayout.tsx     # consistent tool page chrome
│  └─ ui/                # GlassCard · Button · Field · Toggle · Slider · Output · Toast · CopyButton
├─ pages/
│  ├─ Landing.tsx        # tool cards grid
│  └─ ToolPage.tsx       # dynamic tool loader (code-split via React.lazy)
└─ tools/
   ├─ registry.ts        # single source of truth
   ├─ password/  jwt/  uuid/  objectid/  nanoid/
   └─ hash/      base64/ timestamp/ json/
```

### ➕ Adding a new tool

1. Create `src/tools/<slug>/<Name>Tool.tsx` with a default-export component.
2. Append an entry to `src/tools/registry.ts` (lazy-imported).
3. It auto-appears on the landing page and gets a route at `/#/tools/<slug>`.

## 🔐 Security notes

- All randomness uses `crypto.getRandomValues` and `crypto.subtle` — never `Math.random`.
- Password generation uses **rejection sampling** to eliminate modulo bias, plus a final **Fisher–Yates shuffle** so the guaranteed class-coverage chars are not stuck at the start.
- Strength meter reports **bits of entropy** based on the active alphabet size.
- Everything runs in-browser — no network calls, no storage, no tracking.

## 🤝 Contributing

PRs welcome — adding a new tool is intentionally a tiny diff (one folder + one registry line). Open an issue first if proposing a large change.

## 📄 License

[MIT](LICENSE) © ajithakdev
