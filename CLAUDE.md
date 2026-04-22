# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal blog for Bruno Mentges — field notes on data engineering and AI. Astro static site deployed to GitHub Pages. Sister site: [mentgesinformatica.com.br](https://mentgesinformatica.com.br) (consultancy). Articles may cross-post between the two.

## Commands

```bash
npm install          # install deps (package-lock.json is committed)
npm run dev          # local dev server (also: npm start)
npm run build        # production build to dist/
npm run preview      # serve the built dist/ locally
npm run astro -- <cmd>  # pass-through to the Astro CLI (e.g. `astro check`)
```

No tests, lint, or formatter configured.

## Architecture

### Tech stack
- **Astro 4** (static output, no SSR)
- **Tailwind 3** (for the few utilities in CSS) + a full custom CSS system in `src/styles/global.css`
- **MDX** for article content
- **Fontsource-variable/geist** + **geist-mono** — fonts are self-hosted, subset woff2 files emitted by the build

No React, no client-side JS frameworks. Zero `<script>` tags in output HTML by design.

### Design system — "Engineering Precision + Emerald"

Tuned for senior-engineer readers (40+). Summary:

- Palette: light theme, soft gradient background (`#fafbfc → #f4f6f9`), two subtle emerald radial glows behind content. Primary accent `#059669` (emerald-600); secondary emerald `#34d399` used inside SVG diagrams for contrast.
- Typography: Geist Variable for sans, Geist Mono for mono. Body **18 px** / line-height 1.65. Prose body **19 px** / line-height 1.75 — deliberately generous for long-form reading. Minimum anywhere: 17 px (card descriptions). H1 hero clamps to 3 rem max.
- Shape: 4–8 px radii, single-layer subtle shadows, 1 px hairline borders.
- Motion: `prefers-reduced-motion` respected. No decorative animations.
- Containers: `container-marketing` (max-width 1120 px) for home/about/CV/tag pages; `container-prose` (max-width 720 px) for article reading.

All design tokens live in `src/styles/global.css` as CSS variables on `:root`. Tokens: `--text*`, `--bg*`, `--accent*`, `--border*`, `--radius-*`, `--shadow-*`, `--font-*`, `--container-*`, `--ease-out`.

### Content pipeline

- `src/content/config.ts` — single collection `posts` with Zod schema: `title` (required), `published`, `description`, `category`, `tags`, `date`.
- `src/content/posts/*.mdx` — one article per file. Frontmatter must match schema.
- `src/pages/index.astro` — home. Loads collection, sorts by date desc (missing dates sink). Featured card = newest; remaining posts render as responsive grid via `<PostCard>`.
- `src/pages/posts/[slug].astro` — article template. `getStaticPaths` + `post.render()`. Uses `container-prose`. Tag pills in header, reading time computed from body word count (220 WPM). Cross-post note + back link in footer.

### Anonymization rule

Employer names never appear on public pages. Career narrative uses industry + scale descriptors (e.g. "Top-10 Global Ad Tech Platform", "Major B2B Data Intelligence Platform"). Mirrors the convention on the sister consultancy site. Do not reintroduce real company names on any public page.

### Layouts and components

- `src/layouts/Layout.astro` — single base shell. Head (title, description, canonical, OG, Twitter, favicon, RSS alt), skip-link, `<Nav>`, `<main>` slot, `<Footer>`. Accepts `title`, `description`, `canonical`, `ogImage`, `noIndex` props. `canonical` defaults to the current URL under `Astro.site`.
- `src/components/Nav.astro` — sticky blur nav. Active state reflected via `class:list`.
- `src/components/Footer.astro` — brand line, footer nav, copyright.
- `src/components/PostCard.astro` — post card for home / tag pages. Accepts `featured` boolean; featured variant gets larger padding + emerald-tinted gradient.

### Additional routes
- `src/pages/about.astro` — long-form About page, anonymized career narrative.
- `src/pages/cv.astro` — CV summary + links out (LinkedIn, GitHub) for the full version.
- `src/pages/404.astro` — NotFound. `noIndex`.
- `src/pages/tags/[tag].astro` — one page per tag.
- `src/pages/rss.xml.ts` — RSS feed.
- `src/pages/sitemap.xml.ts` — sitemap (handwritten — the `@astrojs/sitemap` plugin had a reduce-on-undefined crash on this Astro version, so we write XML directly).
- `public/robots.txt` — allow all, points to sitemap.

### Article port pipeline

The 8 AI/data articles originated as static HTML on the consultancy site. Conversion was scripted (see `/tmp/port-article.sh` — not committed; describe or regenerate if re-porting). Key transforms applied to each HTML → MDX:

1. Extract body between `<!-- Article Content -->` and `<!-- Footer -->`.
2. Strip the end-of-article `content-cta` consulting block and the outer `<article>`/`<div>` wrappers.
3. Strip HTML comments (MDX refuses `<!-- -->` at root).
4. Color palette sweep: copper `#c2713a` → emerald `#059669`, teal `#2dd4bf` → emerald-400 `#34d399`, ink/slate/silver tones rebased to the neutral scale.
5. Rewrite inter-article links `foo.html` → `/posts/foo`.
6. Trailing orphan `</div>` trimmed (leftover from the stripped outer wrapper).
7. Wrap `<style>` tag contents in a JSX template-literal expression — `<style>{` ` ...` `}</style>` — so MDX doesn't try to parse the CSS `{` as JSX expressions.
8. Inside `<code>` spans: escape `{`, `}`, `_`, `*` to HTML entities — MDX processes markdown inside inline HTML, so `bronze_crm_contacts` in a `<code>` opens a rogue emphasis span.

Ported articles preserve 35+ hand-crafted SVG diagrams.

## Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml` runs on push to `master` (and manual dispatch). Uses `withastro/action@v3` with `package-manager: npm` to build — **requires `package-lock.json`** (committed). Then `actions/deploy-pages@v4` publishes. `.nojekyll` at repo root disables GitHub's default Jekyll processor. `astro.config.mjs` `site` is `https://bmentges.github.io` — this assumes the repo is named `bmentges.github.io` (user-site) or a custom domain is set via `CNAME`. If the repo name stays `bmentges.github.com`, Pages will serve the content under a project-site path and absolute URLs will be wrong.

## Notes

- Adding a new post = create `src/content/posts/<slug>.mdx` with matching frontmatter. Collection picks it up automatically.
- Cross-posting convention: both personal blog and consultancy site self-canonical. Article footer on the blog includes a line noting the cross-post.
- No dark mode yet — light-only by design (matches the consultancy site, simpler for long-form reading). A toggle can be added later by layering `[data-theme="dark"]` overrides in `global.css`.
