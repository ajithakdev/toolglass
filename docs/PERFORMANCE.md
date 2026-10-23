# Performance report

Lighthouse 12.8.2, mobile profile, run in headless Chromium on 2026-10-21 as part of a check across all the ajithakdev.com sites. Google's PageSpeed API was out of free quota that day.

## Score

| Page | Perf | A11y | Best practices | SEO | LCP | FCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| toolglass.ajithakdev.com `/` | 44 | 100 | 100 | 100 | 4.9 s | 1.3 s | 153 s | 0 |

Targets: LCP under 2.5 s, CLS under 0.1, TBT under 200 ms.

## Finding: `GlassScene` blocks the main thread

The 3D glass background on Home (`src/components/home/GlassScene.tsx`) causes almost all of the 153 s of blocking time. Headless Chromium has no GPU, so WebGL falls back to a software renderer (SwiftShader), and every frame of the physical glass material is drawn on the CPU. A real phone sees much less, but PageSpeed's mobile test runs the same way, and that is the number Google uses.

Already in place, so these are not the fix:

- The scene starts in `requestIdleCallback` (400 ms timeout) and is lazy-loaded.
- `prefers-reduced-motion` draws one frame and does not loop.
- The loop stops when the tab is hidden or the hero scrolls out of view.
- Devices with 4 or fewer cores or 4 GB or less memory render at pixel ratio 1.
- No WebGL means the poster stays.

**Fixed on 2026-10-21** (`perf/glass-scene-software-gl`): `buildWorld()` checks the WebGL renderer name on a probe canvas and keeps the poster on SwiftShader, llvmpipe or any software renderer. `failIfMajorPerformanceCaveat` was tried first and does not work, because Chromium's SwiftShader (through ANGLE on Vulkan) passes it. Local Lighthouse: performance 39 to 85, TBT 159 s to 260 ms, LCP 6.4 s to 3.4 s, Best practices 100.

The original plan, kept for reference:

1. **Treat software rendering as "no WebGL".** Pass `failIfMajorPerformanceCaveat: true` to `new WebGLRenderer(...)`. Chromium then refuses the context on SwiftShader, `buildWorld()` returns `null` from its existing `catch`, and the poster stays. This one option should take TBT close to zero in Lighthouse.
2. **Optionally keep the poster on modest devices too** (the `modest` check already exists) instead of only lowering the pixel ratio.
3. Re-run Lighthouse and check that LCP is the hero text or poster, not the canvas.

## Re-running

```sh
CHROME_PATH=/usr/bin/chromium-browser npx -y lighthouse@12.8.2 https://toolglass.ajithakdev.com/ \
  --form-factor=mobile --output=json --output-path=report.json \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo
```

Or paste the URL into https://pagespeed.web.dev for Google's own numbers.

## Bundle size (2026-10-24, #141)

JavaScript a page downloads before it can run (entry plus its preloads), measured on `dist/tools/uuid.html`:

| | Upfront JS (gzip) |
| --- | --- |
| Before | 160.7 KB |
| `About` and `ToolsHub` lazy-loaded | 156.3 KB |
| plus framer-motion `LazyMotion` with `m` components | 130.9 KB |

Most of the remaining 131 KB is react-dom, react-router and framer-motion's `m` core. The framer-motion animation features (`domMax`, about 30 KB gzip) load after first paint from `src/lib/motionFeatures.ts`. Getting under the 100 KB target would mean replacing a library, which is not planned.
