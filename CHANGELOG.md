# Changelog

All notable changes to Toolglass. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Tool sidebar on desktop: favorites, recent and every category one click away, and switching tools no longer blanks the page.

### Changed
- The home page hero is half the height, with your recent, favorite or popular tools right under it.
- Header, content and footer share one 1440px width on every page, so nothing jumps when you move between pages.
- Tighter, denser layout on desktop: smaller headings, cards and spacing.
- Tool URLs stay clean while you work. Settings go into a link only when you press Share, so text you type no longer lands in browser history.
- Calmer layout on big screens: the content column is 1200px wide instead of 1600px, and page headings and section gaps are smaller on desktop. Phone layouts are unchanged.
- The "0 requests" status dot now pulses, so it reads as live. It stays still if your system asks for reduced motion.
- The site now deploys once a week with each release (Sunday), not on every merge. Urgent fixes ship as a same-day patch release.

### Security
- The Markdown preview no longer loads remote images, so a tracking pixel in pasted Markdown can't tell anyone you opened it. Copy and Download still keep the image links.
- The site now sends a Content-Security-Policy that blocks remote images, media and scripts on every page. The API Tester can still call any URL (#142).

### Fixed
- The theme switch is no longer cut off the right edge of the header on phones.
- Picking a short tool category no longer nudges the whole page sideways when the scrollbar disappears.
- Coming back to the home page no longer flashes the flat logo before the 3D glass appears.
- A flat sheet behind the white glass tile no longer peeks out at its edge.
- Pages load less JavaScript up front (161 KB to 131 KB gzipped): the About and Tools pages load on demand, and the animation code loads after the first paint (#141).
- Screen readers now follow the highlighted result in the command palette and hear how many tools match the search. Tab no longer gets stuck when the result list shrinks.
- The home page no longer freezes on devices without a graphics chip, including Google's PageSpeed test. The 3D glass background only starts on a real GPU; otherwise the logo poster stays. Lighthouse mobile performance went from 39 to 85 on a local build.
- Screen readers now name both inputs in the Color tool. The text box used to be read out as an unnamed edit field (#140, thanks @Dtzul04).
- Cron "next runs" in the Timestamp tool now match standard cron: day-of-month and day-of-week are ORed when both are set, 7 counts as Sunday, yearly and leap-day schedules show up, and bad fields like `abc` or `99` show an error instead of a schedule (#137).
- "Clear everything" on the About page now also clears Notepad text, World Clock zones and the API Tester's per-tab credentials (#139).
- Two quick pushes to `main` no longer cancel a site deploy partway through (#144).

## [1.1.1] - 2026-10-21

### Security
- Updated `js-yaml` from 4.1.0 to 4.3.2, which caps YAML merge sequences at 100 entries. A crafted YAML file pasted into the YAML/TOML converter can no longer hang the tab (#131).

## [1.1.0] - 2026-10-20

### Added
- 22 new tools, for 41 in total. Everyday: word counter, text diff, notepad, unit converter, percentage calculator, world clock, stopwatch and timer with pomodoro mode, image compressor (WebP, JPEG, PNG, AVIF, resize, EXIF location stripping), screen recorder.
- Developer: CSV, JSON and SQL INSERT conversion, YAML, TOML and JSON conversion, SQL formatter, JSON to Zod or Valibot, number base converter with bit view, HTML entities, list transformer, Unicode inspector, keycode inspector, HTTP status codes, MIME types with file signature check, IPv4/IPv6 subnet calculator.

### Changed
- JWT generator signs RS256 and ES256 as well as HS256, and generates key pairs (#127).
- JSON formatter shows the line and column of syntax errors and validates against a JSON Schema (#127).
- URL encoder has a batch mode (#127).
- Timestamp converter adds RFC 2822 and local ISO 8601 with offset (#127).
- Pages use up to 1600px of width (#129).

## [1.0.0] - 2026-10-20

### Added
- First release: 19 browser-only developer tools, installable as an offline PWA. Password, UUID, NanoID, ObjectId, QR and JWT generators; JSON formatter, JSON to TypeScript, Base64, URL encoder, JWT decoder, Markdown preview, text case and slug; hash generator and chmod calculator; regex tester, timestamp and cron, color converter, API tester.

[Unreleased]: https://github.com/ajithakdev/toolglass/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/ajithakdev/toolglass/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/ajithakdev/toolglass/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ajithakdev/toolglass/releases/tag/v1.0.0
