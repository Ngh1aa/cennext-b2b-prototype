# CenNext B2B Prototype — Vanilla HTML/CSS/JS

This repository is a framework-free G.I.E prototype. The current Home, Services and Contact pages present an industrial systems-integration concept; they do not assert verified company capabilities or credentials.

## Files

- `index.html` — semantic page structure and content
- `styles.css` — complete responsive visual system and interactions
- `script.js` — mobile navigation and active-section highlighting
- `services.html` — selectable concept service scopes and proposed deliverables
- `contact.html` — local project-brief preparation, review and text download
- `assets/` — illustrative industry photography, with sources listed in `IMAGE_SOURCES.md`
- `rfq-checklist.txt` — downloadable blank project checklist

## Run locally

No package manager, build step, React, TypeScript, Vite, or Tailwind is required.

You can open `index.html` directly in a browser, or serve the folder with any static server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

The concept update covers only Home, Services and Contact. Other existing pages retain their earlier motor-repair content and styling; this is not a complete whole-site migration. The brief form sends no request and has no backend: entries stay in page memory and clear on refresh. Photographs illustrate an industry context, not G.I.E facilities or staff. Visual acceptance and real-user validation remain unverified.

The previous React/TypeScript implementation remains available in Git history. This commit replaces the working tree with a static implementation so the prototype is easier to hand off, host, and edit.
