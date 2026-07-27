# STATE — Agent Guide

STATE creates finite digital experiences intended to improve the next hour of a person's real life. The product must never depend on addiction, fear, guilt, fake urgency or exaggerated health claims.

## Who this repository serves

- people intentionally choosing a STATE experience;
- testers whose feedback and locally stored outcomes inform iteration;
- people receiving sponsored or public-interest access;
- schools, carers, NGOs or institutions adapting low-risk open formulas;
- maintainers and contributors responsible for truthful, accessible delivery;
- AI agents that need clear product principles, evidence boundaries and release checks.

People affected by health, productivity or emotional claims remain more important than engagement metrics. AI agents may help build and evaluate experiences; they do not diagnose, prescribe or declare that a formula works.

## North star

Create intentional, finite experiences that leave people more capable of returning to real life. The product succeeds when it can be closed.

## Invariants

1. Every formula has a clear beginning, bounded duration, ending and exit.
2. No endless feeds, punishment streaks, guilt notifications, manufactured dependency or hidden persuasion.
3. Users can stop at any time and retain control of locally stored data.
4. Evidence starts at zero. Distinguish demonstration data, self-report, observed results and hypotheses.
5. Screen time, retention and repeated use are guardrails—not primary success metrics.
6. Clearly disclose automation, personalisation, sponsorship and experimental status.
7. Accessibility, reduced motion and mobile use are part of product correctness.
8. Public-interest access must not become coercive conversion theatre.

Read `docs/ethics.md` before changing product mechanics, messaging, monetisation or measurement. Read `docs/evidence-protocol.md` before changing outcome collection, analysis or claims.

## Repository orientation

- `index.html` — deployable entry point.
- `app/parts/` — deterministic browser bundle, loaded in order.
- `docs/ethics.md` — ethical constitution.
- `docs/evidence-protocol.md` — beta evidence rules.
- `docs/vision.md` — broader product direction.
- `.github/workflows/pages.yml` — static deployment.

## Working boundaries

Agents may independently improve documentation, accessibility, tests, deterministic behaviour and clearly reversible UI defects.

Require explicit human approval before:

- adding a new formula, behavioural mechanism or persuasive notification;
- collecting new data or changing its purpose, retention or export;
- publishing effectiveness, health, safety or impact claims;
- adding accounts, analytics, external assets, payments or backend services;
- changing sponsorship, donation or public-interest access mechanics;
- deploying to production.

Hard privacy and release guarantees should be implemented in code or workflow permissions rather than trusted to this file alone.

## Verification

For local review, serve the static app and test the complete preview and 25-minute flows where practical:

```bash
python -m http.server 8000
```

Check first use, stopping early, completion, local outcome storage, export/import, keyboard navigation, narrow mobile layout and reduced motion. Report any flow that could not be exercised.

## Definition of done

A change is ready for review when it preserves finiteness, consent and truthful evidence; exposes meaningful failure states; introduces no hidden data or engagement mechanism; works accessibly on mobile; and remains understandable and reversible for the next human or agent.
