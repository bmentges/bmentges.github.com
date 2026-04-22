# Project Overview: Bruno Mentges | The Neural Nexus

This is the personal blog of **Bruno Mentges**, transformed into a high-end, AI-focused technical platform in 2026. The site has been migrated from Jekyll to **Astro** for superior performance and modern developer experience.

## Core Technologies
- **Astro (v4/v5)**: Static site generator using "Islands Architecture".
- **Tailwind CSS**: Utility-first CSS for high-end styling.
- **MDX**: Markdown with React/Svelte components for interactive AI demos.
- **React**: Used for dynamic components (e.g., `NeuralBackground`).
- **Framer Motion**: For smooth, high-impact animations.

## Directory Structure
- `src/content/posts/`: MDX files for blog articles.
- `src/components/`: Reusable React/Astro components (e.g., `NeuralBackground.tsx`).
- `src/layouts/`: Base HTML templates (`Layout.astro`).
- `src/pages/`: 
  - `index.astro`: The home page with the Hero section and Bento Grid.
  - `posts/[slug].astro`: Dynamic route for rendering blog articles.
- `src/styles/`: Global CSS and Tailwind directives.
- `astro.config.mjs`: Core framework configuration.
- `backup/`: Contains the original Jekyll files (for historical reference).

## Building and Running

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Commands
- **Install dependencies**:
  ```bash
  npm install
  ```
- **Serve locally**:
  ```bash
  npm run dev
  ```
- **Build for production**:
  ```bash
  npm run build
  ```

## Deployment
The project is set up for **GitHub Pages**. Deployments are handled via building the project and pushing the `dist/` directory or using a GitHub Action (recommended for Astro).

## Development Conventions
- **New Posts**: Add `.mdx` files to `src/content/posts/`. Ensure they follow the Zod schema defined in `src/content/config.ts`.
- **Aesthetics**: Maintain the "Neural Nexus" theme (Dark mode, glassmorphism, high-end typography).
