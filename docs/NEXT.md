# What's next for Toolglass

Written 2026-11-10. Open this file to pick up where we left off. Tick boxes as things get done and add the date.

## Where we are (2026-11-10)

- 43 tools live at https://toolglass.ajithakdev.com, v1.2.0 released today. 65 merged PRs, 85 commits on `main`, 2 outside contributors (Dtzul04, shubham2Nayak).
- Usage, as far as we can see it:
  - GitHub: 2 stars, 2 forks. Repo page views in the last 14 days: 75 from 8 people, and 30 of those came from github.com itself (mostly us).
  - The site has no analytics on purpose, so we can't count visitors. A `site:toolglass.ajithakdev.com` web search returned nothing.
  - `~/.claude/launch-log.md` has no Toolglass entry: **it was never launched anywhere.**
- The SEO basics exist: one HTML page per tool with its own title and description, a sitemap with 43 URLs, and a robots.txt. What's missing: no Google Search Console or Bing verification, and no `docs/SEO.md` (the global rule says every website repo keeps one).

## Why nobody uses it yet

1. **Nobody knows it exists.** Every hour so far went into building. Zero went into telling people, and there's no post, listing or link anywhere. This is the main reason, and it's the cheapest one to fix.
2. **Search engines haven't been told about it.** The sitemap was never submitted, so Google may not have crawled it. People find "compress image" or "jpg to pdf" tools through search, and that's exactly the traffic we want.
3. **"Developer tools in the browser" is a crowded shelf.** it-tools, CyberChef, DevToys and transform.tools already own it, with years of stars and backlinks. Another JSON formatter won't pull anyone away.
4. **The thing that makes us different isn't the headline yet.** Most "free online" converter sites upload your file to their server and show ads. Toolglass doesn't upload anything, and the "0 requests" counter proves it live. That pitch works for everyone who has ever uploaded a PDF or ID photo to a random site, not just developers.
5. **We can't tell if anything works.** No analytics, by design. Search Console impressions and GitHub traffic are the only numbers we'll get, so they have to be set up before launch.

## What the research says (2026-11-10)

Stars of the projects closest to us, checked with the GitHub API today:

| Project | What it is | Stars | Started |
|---|---|---|---|
| Stirling-PDF | Self-hosted PDF toolbox (replaces Adobe/iLovePDF) | 96,149 | 2023-01 |
| it-tools | Dev tools in the browser, Docker image | 41,167 | 2020-04 |
| CyberChef | Data transforms in the browser | 36,354 | 2016-11 |
| DevToys | Desktop dev tools app | 32,240 | 2021-09 |
| VERT | File converter that runs locally, self-hostable | 16,235 | 2024-11 |
| omni-tools | 100+ everyday tools, self-hosted Docker app | 10,671 | 2024-06 |

What the fast growers have in common:

1. **A Docker image and a launch on r/selfhosted.** Stirling-PDF, it-tools, VERT and omni-tools all have a one-line `docker run`. omni-tools posted every release on r/selfhosted (v0.4.0, v0.6.0, a "massive update" post), and that brought blog write-ups (virtualizationhowto) and YouTube reviews. Self-hosters star repos; casual web visitors don't.
2. **They name the paid app they replace.** Stirling-PDF is "the Adobe alternative", VERT is "the file converter that never uploads". People search for "iLovePDF alternative" and "TinyPNG alternative", not for "developer tools".
3. **Getting the first 100 stars is a manual job.** Every write-up (Preevy, Andrea Bizzotto, the Transmute post on r/buildinpublic) says the same: ask friends and colleagues, post Show HN with the repo link and a first comment that explains why, submit to aggregators and awesome lists, and celebrate milestones in public. GitHub Trending kicks in only after a burst of stars in one day, so launches should be grouped into one or two days instead of spread thin.
4. **"No upload" alone is no longer unique.** editryk, imagepdf.tools, sammapix, altftool, tinypngnow and minicompressor all claim it. What they don't have: open source (MIT), self-hostable, a live "0 requests" counter that proves it, and offline use. That combination is our pitch.

What changes in the plan because of this: the Docker image moves from "after launch" to "before launch", the pitch names the paid apps, and the Reddit launch targets r/selfhosted first.

## The plan

Pause new features for about 3 weeks and spend that time on distribution. Building resumes once people can find the site.

Positioning to use everywhere: **"Open-source tools that never upload your files. Use it online or self-host it with one Docker command."** Name the apps we replace in titles and posts: iLovePDF, Smallpdf, TinyPNG, online converters, it-tools. Lead with the everyday tools (image compressor, PDF, QR, unit converter, word counter) and put the developer tools second.

### Phase A: get findable (1 or 2 sessions, before any post)

- [ ] Verify the site in Google Search Console and Bing Webmaster Tools, then submit `sitemap.xml` to both. **Needs you:** sign in to both with the personal Google account and paste me the verification tag or TXT record. I add the tag, or put the TXT record in Cloudflare DNS (free).
- [ ] Create `docs/SEO.md` from the template (`~/projects/ajithakdev.com/docs/SEO.md`): setup, release checklist, what to check monthly.
- [ ] Fix page titles: they put an em dash between the tool name and "free and private", which breaks the house rule. Use "Image Compressor: free and private | Toolglass".
- [ ] Fix duplicated description text (the image compressor's says "nothing is uploaded" twice). Check every tool's description in `catalog.ts`.
- [ ] Give every tool page a short "How to use" and "Is my file uploaded? No" section in plain words. That's what ranks for long-tail searches and what people want to read.
- [ ] One Open Graph image per tool (generated at build time), so shared links show a proper card.
- [ ] **Docker image plus BASE_PATH** (moved up from Phase C): a small nginx image on GHCR (free for public repos), one `docker run -p 8080:80 ghcr.io/ajithakdev/toolglass` line in the README, and a compose example. This is the entry ticket to r/selfhosted and awesome-selfhosted.
- [ ] README top: one GIF (compress an image with DevTools open, 0 requests), the "replaces iLovePDF / TinyPNG / online converters" line, the live link, the Docker line. Most visitors decide in the first screen.
- [ ] Decide on counting (**your call**): today GitHub Pages serves the site directly (DNS only on Cloudflare). Turning on Cloudflare's free proxy for the subdomain would give request counts in its dashboard with no script on the page, so the "no analytics" promise holds. It needs a careful switch (SSL mode Full) so HTTPS doesn't break. Say yes or no.

### Phase B: launch (week of 2026-11-16, in posting windows 00:00 to 03:00 or 07:00 to 11:30 IST)

I draft everything in your voice in `~/Documents/toolglass-launch-posts.md`. You paste and post. Log each one in `~/.claude/launch-log.md`.

- [ ] **First 100 stars, by hand, before the public posts:** you message friends, ex-classmates and people from the Fedora/uBlue forums who might use it, one at a time, with the link and one line on why. Not Valor colleagues.
- [ ] **Day 1 (one burst, so GitHub Trending can notice):** r/selfhosted post ("Toolglass: 43 browser tools, nothing uploaded, one Docker command"), Show HN with the repo link and a first comment on why, and the dev.to article, all in the same posting window.
- [ ] After that, post every release on r/selfhosted with a short "what's new" list, the way omni-tools does.
- [ ] r/prettyusefulwebsites and r/InternetIsBeautiful for the hosted site (rules differ: check each one's posting rules first).
- [ ] dev.to article: "I built 43 browser tools that never upload your files" (how it works, the 0-requests counter, what's open source). Then Medium (import) and Hashnode, both pointing to dev.to as the original.
- [ ] AlternativeTo: list Toolglass as an alternative to iLovePDF, TinyPNG, it-tools and CyberChef (free queue only).
- [ ] Product Hunt launch (free). Pick a Tuesday to Thursday, 00:01 PT.
- [ ] Reddit, once the account has enough karma: r/InternetIsBeautiful (best fit), r/webdev Showoff Saturday, r/privacy (only if it fits their rules), and r/selfhosted once Docker exists. Claude can't open reddit.com, so these are fully yours.
- [ ] Show HN once the HN account is allowed to post one.
- [ ] Awesome lists: awesome-privacy, awesome-web-tools style lists, and awesome-selfhosted after Docker. If a list needs a human to submit, I give you the field values.
- [ ] One short YouTube video (60s): compress an image with DevTools open, showing zero network requests. The brief goes in `~/Documents/youtube/`.
- [ ] Mention it where you already have a voice (Fedora and uBlue forums), only where it's on topic.

### Phase C: product changes that bring people (after launch, about 1 per week)

1. [ ] **PDF tools** (merge, split, compress, JPG to PDF): the most searched "free online" category, and the one where uploading to a stranger feels worst. Needs the `pdf-lib` dependency decision (#128). **Needs your OK on the dependency.**
2. [ ] **PWA offline install (#191):** "works offline" is a second proof of privacy, and installed apps get reused.
3. [ ] **Platform PR:** `npm run new-tool` scaffold, shared file-in and download helpers, one test per tool. Makes every later tool, and every contributor PR, faster.
4. [ ] Tier A tools from the gap list in `~/.claude/plans/i-have-couple-of-melodic-cascade.md`, picked by search demand, not by what's fun to build.
5. [ ] One "X alternative that never uploads your files" page per paid app we replace (iLovePDF, TinyPNG, Smallpdf): which of our tools covers what, and what we don't do yet. Honest comparison pages rank and get linked.

### Phase D: contributors

- [ ] Label 5 or 6 small tool issues `good first issue` with clear file pointers, and tell Dtzul04 they're open.
- [ ] Add a "Add a tool in 15 minutes" section to CONTRIBUTING once the scaffold exists.
- [ ] Reply to every issue and PR within a day. A slow first reply is the main reason first-time contributors don't come back.

## How we'll know it's working

Check these on the dates below and write the numbers here.

| Check date | Target | Actual |
|---|---|---|
| 2026-11-30 | Search Console verified, sitemap read, any impressions at all; dev.to post live; 10 stars | |
| 2026-12-15 | 1,000 search impressions a month; 25 stars; first issue from someone we don't know | |
| 2027-01-15 | 100 clicks a month from search; 50 stars; 3 outside contributors | |

If a date passes with no movement, change the channel or the positioning. Don't respond with more tools.

## Build backlog (keep small, do between launch work)

- [ ] Sunday 2026-11-15: release v1.3.0 (User-Agent tool, support links, dependency updates). After the deploy, test "Copy as JSON" on the User-Agent page.
- [ ] Check the 3D hero in its 340px box in a real browser.
- [ ] About sticky column may clip on screens under about 760px tall.
- [ ] Red sticker text in dark mode: check contrast.
- [ ] API Tester: the cURL placeholder is cut off on mobile.
- [ ] `@vitejs/plugin-react` 6.2.1 is held back (needs Babel 8). Try again next month.

## What I need from you

1. Sign in to Google Search Console and Bing Webmaster Tools, and send me the verification codes.
2. Yes or no on Cloudflare's script-free visitor counts.
3. Yes or no on adding `pdf-lib` for PDF tools.
4. Post the launch drafts when they're ready (I can't post for you).
5. Send the link by hand to 20 to 30 people you know for the first stars.
