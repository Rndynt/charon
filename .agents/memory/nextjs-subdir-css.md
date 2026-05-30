---
name: Next.js subdirectory CSS loading
description: Why CSS fails when Next.js runs as a subdirectory in a monorepo with shared node_modules
---

## Rule
When Next.js runs from a subdirectory (e.g. `dashboard/`) that has no own `node_modules/`, webpack cannot find its CSS loaders. Even plain `body {}` CSS fails with "Module parse failed: Unexpected token".

**Why:** Next.js's webpack CSS loader resolution depends on `node_modules` being accessible from `process.cwd()` or the project dir. Without a local `node_modules/`, CSS rules are never registered.

**How to apply:** For the Charon dashboard (`dashboard/`), use Tailwind CDN in `dashboard/app/layout.jsx` (`<script src="https://cdn.tailwindcss.com" />`) instead of a `globals.css` with `@tailwind` directives. Remove all CSS file imports from layout.
