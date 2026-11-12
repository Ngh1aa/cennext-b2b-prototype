# CenNext B2B Prototype — Vanilla HTML/CSS/JS

This repository is a framework-free G.I.E prototype. The site presents an industrial systems-integration concept; it does not assert verified company capabilities or credentials, and no client work is claimed.

Every main workflow works end to end in the browser. Only the backend is missing: nothing is sent anywhere, and every confirmation says so.

## Workflows

- **Services** — `services.html` compares the four proposed services; `service.html?id=<id>` shows scope, process, deliverables, related programs and a CTA into the brief builder (with a not-found state).
- **Programs** — `programs.html` lists three plant support programs; `program.html?id=<id>` shows flow, scope, fit signals and related services (with a not-found state).
- **Repair vs. replace** — `repair-vs-replace.html#decision-tool` is a seven-question screening tool. It validates inline, explains the result and can carry it into a new brief.
- **Project brief builder** — `rfq.html` has seven steps: service, equipment and site, timeline and budget, attachments (file names and sizes only, with remove), contact details, review and a confirmation with a reference. Drafts save automatically and resume after a reload.
- **My requests** — `requests.html` lists drafts and submitted briefs with status filters, search and empty states. `request.html?id=<id>` shows a status timeline and lets you continue editing a draft, duplicate a request, or withdraw it (or discard a draft).
- **Contact** — `contact.html` is a general enquiry form with inline validation and a success state.
- There are no case studies, because the concept claims no client work.

## Data

- `data.js` is the single seed file: services, programs, form options and two example requests.
- `app.js` keeps user data in `sessionStorage` (key `gie-demo-state`), so it survives navigation and reload within one tab.
- The footer of every site page has **Reset demo data** and **Simulate a failure on the next request**. The failure option makes the next load or submit fail once and shows a recoverable error with **Try again**.

## Files

- `index.html`, `services.html`, `service.html`, `rfq.html`, `requests.html`, `request.html` and `contact.html` use the concept styling in `styles.css` and `app.css`.
- `programs.html`, `program.html`, `repair-vs-replace.html` and `why-gie.html` keep the earlier GIE motor-repair styling (`styles.css`, `inner-pages.css`) with `app.css` added.
- `script.js` handles navigation, photography and the service comparison picker.
- `app.js` holds the store, simulated latency and failures, and every workflow.
- The documentation pages (`design-system.html`, `component-states.html`, `sitemap.html`, `user-flow.html`, `prototype.html`) use `case-study.css`.
- `rfq-checklist.txt` is the downloadable blank checklist.

## Run locally

No package manager or build step is needed. Serve the folder:

```bash
py -3 -m http.server 8906 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8906/`.

## End-to-end test

`tests/e2e.cjs` uses Playwright (the library, not the test runner). It covers every flow above, reset, empty and error states, and checks every page for console errors and `href="#"`.

```bash
NODE_PATH=<folder containing playwright> node tests/e2e.cjs
```

## Notes

Photographs show an industry context, not G.I.E facilities or staff. The legacy pages still describe Gainesville Industrial Electric's motor-repair business; this is not a complete migration to the concept. `BRIEF_COMPLIANCE.md` describes an earlier single-page landing page. Real-user validation has not been done.
