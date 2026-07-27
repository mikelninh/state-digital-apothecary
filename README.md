# STATE — Digital Apothecary

**Human states, consciously designed.**  
*Digital drugs. No hangover.*

> Do not seek to be impressive. Seek to be genuinely useful — and make usefulness beautiful.

STATE is an experimental digital concept store for finite, intentional experiences that help people return to real life stronger. Instead of optimising for screen time, STATE asks one question:

> Did this experience improve the next hour of your actual life?

## Current public prototype

The `main` branch contains **STATE MVP v3 — Evidence Lab**, centred on the first working formula: **FOCUS 25**.

- Before → during → after experience
- Real 25-minute mode and 60-second preview
- Local, privacy-first outcome storage
- JSON result export/import for small beta tests
- Honest evidence dashboard starting at zero
- Transparent impact ledger
- Static browser app with no backend or external assets

## V4 — First Real Dose

Development is active on `v4/first-real-dose`.

The first implementation slice lives in `v4/` and adds:

- one visible outcome before the dose;
- resistance and energy capture;
- a three-step environment ritual;
- a focused timer room with pause, early completion and honest exit;
- post-dose outcome and next-hour measurement;
- a privacy-first local evidence dashboard;
- an exportable local proof receipt;
- responsive design and reduced-motion support.

Run it locally from the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/v4/`.

## Product principles

1. **Finite by design** — every experience has a clear ending.
2. **Outcome over attention** — success means the user can close the product.
3. **No emotional traps** — no guilt, streak pressure, fake urgency or manufactured dependency.
4. **Evidence starts at zero** — claims must be earned through honest testing.
5. **Abundance by default** — the commercial model aims to fund free access for others.
6. **Open commons** — selected formulas may be released for schools, carers, NGOs and public institutions.
7. **Rights before tokens** — shared ownership begins with clear contracts and accepted proof of contribution.

## Roadmap

- **V4:** make one formula genuinely useful.
- **V5:** launch the Human Starter Pack and buy-one-fund-one ledger.
- **V6:** open an invite-only Formula Studio with contribution receipts and bounded project participation.
- **V7:** establish the Commons protocol, civic missions and progressively decentralised governance.

See:

- `docs/roadmap-v4-v7.md`
- `docs/dao-ownership-blueprint.md`
- `docs/v4-product-spec.md`
- `docs/ethics.md`
- `docs/evidence-protocol.md`

## Repository map

```text
.
├── index.html                  # Current public v3 entrypoint
├── app/parts/                  # Current v3 browser bundle
├── v4/
│   ├── index.html              # First Real Dose experience
│   ├── app.css
│   └── app.js
├── docs/                       # Vision, ethics, evidence, roadmap and ownership
└── .github/workflows/
    └── pages.yml               # Static GitHub Pages deployment
```

## Status

Early experimental prototype. Not medical treatment, diagnosis or professional healthcare advice. The proof receipt in V4 is local product evidence, not a token, financial instrument or legal ownership claim.

## Rights

Copyright © 2026 Mikel / STATE. All rights reserved for the brand, interface and current prototype unless a specific component is explicitly released under a separate open-source licence.
