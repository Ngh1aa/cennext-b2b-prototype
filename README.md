# CenNext B2B Prototype — Vanilla HTML/CSS/JS

This repository is a framework-free, unofficial redesign concept for Gainesville Industrial Electric (G.I.E) by Đỗ Anh Nghĩa. It is not affiliated with the company; every page footer says so in one line. No client work is claimed.

Every main workflow works end to end in the browser. There is no backend: data stays in `sessionStorage`. The visible UI reads like a shipped product (no prototype banner or notices).

**Entry URL:** https://cennext-b2b-prototype.vercel.app/ (the homepage; there are no accounts).

**Demo tools:** add `?demo=1` to any page URL (for example `requests.html?demo=1`) to show a small floating **Demo tools** panel with **Fail the next request** and **Reset demo data**. The flag stays on for that tab; `?demo=0` turns it off.

## Workflows

- **Services** — `services.html` compares the four proposed services; `service.html?id=<id>` shows scope, process, deliverables, related programs and a CTA into the brief builder (with a not-found state).
- **Programs** — `programs.html` lists three plant support programs; `program.html?id=<id>` shows flow, scope, fit signals and related services (with a not-found state).
- **Repair vs. replace** — `repair-vs-replace.html#decision-tool` is a seven-question screening tool. It validates inline, explains the result and can carry it into a new brief.
- **Project brief builder** — `rfq.html` has seven steps: service, equipment and site, timeline and budget, attachments (file names and sizes only, with remove), contact details, review and a confirmation with a reference. Drafts save automatically and resume after a reload.
- **My requests** — `requests.html` lists drafts and submitted briefs with status filters, search and empty states. `request.html?id=<id>` shows a status timeline and lets you continue editing a draft, duplicate a request, or withdraw it (or discard a draft).
- **Contact** — `contact.html` is a general enquiry form with inline validation and a success state.
- There are no case studies; no client work is claimed.

## Data

- `data.js` is the single seed file: services, programs, form options and two seeded requests (RFQ-1001 from Harlow Creek Packaging, and an unfinished draft RFQ-1002).
- `app.js` keeps user data in `sessionStorage` (key `gie-demo-state`), so it survives navigation and reload within one tab.
- With `?demo=1`, the **Demo tools** panel offers **Reset demo data** and **Fail the next request**. The failure option makes the next load or submit fail once and shows a recoverable error with **Try again**.

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

`tests/e2e.cjs` uses Playwright (the library, not the test runner). It first checks that product pages show no prototype wording, no documentation links and no demo tools without `?demo`, then switches `?demo=1` on and covers every flow above, reset, empty and error states, and checks every page for console errors and `href="#"`.

```bash
NODE_PATH=<folder containing playwright> node tests/e2e.cjs
```

## Notes

Photographs show an industry context, not G.I.E facilities or staff. The legacy pages still describe Gainesville Industrial Electric's motor-repair business; this is not a complete migration to the concept. The documentation pages are not linked from the product pages but stay available by direct URL. `BRIEF_COMPLIANCE.md` describes an earlier single-page landing page. Real-user validation has not been done.
