# STATE V6.5 — Mobile Learning Loop

## Product goal

V6.5 turns Daily Dose into a mobile-first candidate for repeated use and introduces a private learning loop that starts at zero.

> Better on the phone. More useful over time. Never more invasive.

## Mobile-first interaction standard

- Use `100dvh` and safe-area insets for modern phones.
- Keep core controls at least 44–48 px high.
- Put practice controls inside the lower thumb zone.
- Show only practice, time, pause and a gentle exit during a dose.
- Use a persistent mobile dock for Today and My Patterns, not a feed.
- Keep state selection one-handed, explicit and visually confirmed.
- Request Screen Wake Lock during a practice when the browser supports it.
- Haptics are subtle, optional by device capability and never required.
- Respect reduced-motion preferences.

## Learning loop

### 1. Immediate observation

After a dose, STATE records only what can be observed now:

- arrival state;
- formula and dose length;
- completion or honest exit;
- before and after intensity;
- chosen next action;
- optional note;
- time-of-day bucket.

### 2. Deferred next-hour follow-up

The north-star question is not asked immediately. A session stores a follow-up due time one hour later. On a later visit, the person may answer:

> Did this improve your actual life during the next hour?

The answer is optional, can be dismissed and remains in local browser storage.

### 3. Personal evidence

When sufficient records exist, STATE may show:

- number of similar sessions;
- average immediate intensity shift;
- average next-hour usefulness;
- quick versus full-dose comparison;
- time-of-day signals;
- weak signals where a condition repeatedly did not help.

## Recommendation adaptation

V6.5 does not invent a personalised treatment plan. It can adapt the default dose length only when there are at least two resolved next-hour follow-ups for both quick and full versions of the same state.

If evidence is insufficient, Quick remains the low-friction default.

If three or more resolved sessions have low next-hour usefulness, STATE displays a caution rather than hiding the result.

## Evidence language

Allowed:

- “Across four of your recorded sessions…”
- “A personal pattern may be beginning.”
- “Morning sessions averaged…”
- “This condition may not be helping enough yet.”

Not allowed:

- “STATE knows what works for you.”
- “This proves CALM 10 treats anxiety.”
- “Your nervous system needs this formula.”
- diagnostic or causal language based on self-report data.

## Privacy

- Storage is local-only in this prototype.
- No account or cloud sync is required.
- The person can export the raw JSON.
- The person can delete all records.
- Employers, schools and health partners receive no individual emotional records.
- No streaks, ranks, comparison or retention pressure are calculated.

## Success criteria

V6.5 succeeds when:

1. a first-time mobile user selects a state without explanation;
2. Quick mode begins a dose within seconds;
3. practice controls are reachable with one hand;
4. the screen remains awake when supported;
5. immediate and deferred outcomes remain distinct;
6. personal claims remain appropriately uncertain;
7. the person can see, export and delete their data;
8. leaving STATE still feels like successful completion.
