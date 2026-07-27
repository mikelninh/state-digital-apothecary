# STATE V6.5.1 — Private Beta

## Product goal

V6.5.1 freezes feature expansion and prepares the mobile Daily Dose for a seven-day private beta with 5–8 trusted adults.

> One clear state. One finite condition. One honest return to life.

## Beta hardening

### First-use boundary

- explicit private-beta status;
- adults-only test cohort;
- not medical treatment, diagnosis or emergency support;
- local-storage explanation before entry;
- breathing safety acknowledgement;
- entry remains voluntary.

### Mobile resilience

- safe-area and `100dvh` layout inherited from V6.5;
- thumb-friendly state selection and practice controls;
- Screen Wake Lock where supported;
- wall-clock timer rather than interval-only countdown;
- correct elapsed time after backgrounding;
- recoverable practice and reflection state after reload or accidental closure;
- pause becomes natural-breathing space rather than task debt.

### Honest outcomes

- immediate intensity change remains separate from next-hour usefulness;
- zero change is explicitly accepted;
- increased intensity is retained rather than hidden;
- low next-hour usefulness receives honest feedback;
- test sessions are excluded from personal pattern metrics.

### Tester feedback

- optional feedback entry from header, open door and final screen;
- native Web Share API on supported mobile devices;
- clipboard fallback;
- no feedback is transmitted automatically;
- device/build diagnostics are included only when the tester leaves the visible checkbox enabled;
- a non-blocking prompt appears after three real sessions.

### Hidden tester tools

Open with `?beta=1`, or tap the `BETA 0.1` chip seven times.

Tools:

- 15-second practice;
- make the newest follow-up due now;
- seed clearly marked demo pattern records;
- copy a debug report;
- reset onboarding;
- clear all local beta data.

## Data model

All records remain in the current browser under the V6.5.1 storage namespace. Existing V6.5 sessions are migrated once when possible.

The user can:

- export raw JSON;
- delete all session records;
- discard an unfinished session;
- decline onboarding;
- dismiss a one-hour follow-up;
- share no feedback at all.

## Private beta scope

- 5–8 trusted adults;
- seven days;
- at least three genuine uses per participant where possible;
- mixed iPhone and Android devices;
- at least one wellbeing sceptic;
- no schools, employers, patients or minors;
- no efficacy claims.

## Exit criteria

The build is ready for a wider beta only if:

1. people can start without live explanation;
2. no severe mobile blocker appears;
3. pause, stop and data deletion remain obvious;
4. reloading during a dose does not destroy the session;
5. neutral and negative results can be recorded without pressure;
6. several testers return voluntarily in a real moment;
7. at least some next-hour answers differ from immediate impressions;
8. feedback identifies a small number of coherent improvements rather than fundamental confusion.

## Explicitly deferred

- accounts and cloud sync;
- push notifications;
- Spotify or music integration;
- AI chat;
- additional formulas;
- community features;
- B2B dashboards;
- clinical or workplace outcome claims.

> We are testing whether people reach for STATE when life is actually happening.
