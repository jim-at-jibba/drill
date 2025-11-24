# drill implementation plan

- [x] Phase 0 – Repo + scaffolding
  - [x] Init npm project, add deps (TypeScript, Ink v5, React, yaml, etc.)
  - [x] Create `src/`, `models/`, `store/`, `srs/`, `ui/`, `utils/`
  - [x] Add basic `src/index.ts` CLI entry using Ink + TSX
  - [x] Add simple config loader `utils/config.ts` (base dir, defaults to `~/drill`)

- [x] Phase 1 – Core models
  - [x] Implement `models/Card.ts` with fields from doc
  - [x] Add constructor + static `fromParsedMarkdown(...)`
  - [x] Add `serialize()` on Card delegating to writer util
  - [x] Implement `models/Deck.ts` with counts + helper methods
  - [x] Implement `Deck.getDueCards()`, `getNewCards()`, `getStats()`

- [x] Phase 2 – Markdown parsing/writing
  - [x] Implement `store/parser.ts` with `parseMarkdownCard(filePath, content)`
  - [x] Split frontmatter, parse YAML, extract title/Question/Answer via regex
  - [x] Compute `nextReview` via `calculateNextReview(frontmatter)` helper
  - [x] Implement `store/writer.ts` with `serializeCard(card)`
  - [x] Build frontmatter and markdown body per spec
  - [x] Implement `utils/dates.ts` (`formatDate`, `startOfToday`, `addDays`, `isDue`)

- [x] Phase 3 – CardStore + filesystem
- [x] Implement `store/CardStore.ts` ctor `(baseDir)` and `this.decks = new Map()`
- [x] Implement `loadDecks()` walking dirs under baseDir, reading `.md` files
- [x] For each file, `parseMarkdownCard`, attach `deckName`, push into deck
- [x] After loading, compute per-deck counts (total, due, new, learning)
- [x] Implement `getDueCards(deckName?)` using `startOfToday()` and sort by `nextReview`
- [x] Implement `getNewCards(deckName?)` using `repetitionCount` and `lastReviewed`
- [x] Implement `saveCard(card)` to write markdown and update cache
- [x] Implement `getStats(deckName?)` for total/due/new/learning/mature/retention


- [x] Phase 4 – SM-2 algorithm
  - [x] Implement `srs/sm2.js` with `calculateSM2(card, quality1to5)`
  - [x] Validate quality, map 1–5 to 0–5 if needed
  - [x] Apply EF formula with min 1.3 and interval rules (0,1,6, then `round(prev * EF)`)
  - [x] Compute `nextReview` using `addDays`
  - [x] Export `QUALITY_RATINGS` table matching doc comments
  - [x] Implement `calculateNextReview(frontmatter)` helper

- [x] Phase 5 – Ink UI: foundation
  - [x] Implement `ui/App.tsx` with `screen` state and `store` state
  - [x] On mount, create `CardStore(config.baseDir)` and `await loadDecks()`
  - [x] Render `MainMenu`, `StudyScreen`, `BrowseDecks`, `StatsScreen` via switch
  - [x] Implement `ui/MainMenu.tsx` with counts and menu options
  - [x] Wire `src/index.ts` to parse CLI args and render `App`

- [x] Phase 6 – Ink UI: Study flow
  - [x] Implement `ui/StudyScreen.tsx` with `currentCard`, `showAnswer`, `dueCards`
  - [x] On mount, load due cards via `store.getDueCards(deckName)`
  - [x] Implement `loadNextCard()` to advance through due cards
  - [x] Implement `useInput` handling: SPACE, `1–5`, `q`
  - [x] Implement `handleRating(quality)` calling `calculateSM2` and `store.saveCard`
  - [x] Render question, conditional answer, and rating prompt
  - [x] Handle empty state when no due cards

- [x] Phase 7 – Ink UI: Browse + Stats
  - [x] Implement `ui/BrowseDecks.tsx` listing decks with `ink-select-input`
  - [x] Implement deck detail view with per-deck stats and "Study deck" action
  - [x] Implement `ui/StatsScreen.tsx` with global stats summary
  - [ ] Optionally add simple forecast of future due counts

- [x] Phase 8 – Config, error handling, performance
  - [x] Implement `utils/config.js` resolving base dir from CLI/env
  - [x] Ensure base dir exists or show friendly error
  - [x] Wrap fs operations with try/catch and user-facing error messages
  - [x] Skip malformed markdown/frontmatter with warnings
  - [x] Keep deck + card cache in `CardStore`
  - [x] Optionally expose `reload()` to re-scan filesystem
  - [ ] Optionally add `fs.watch`-based auto-reload

- [x] Phase 9 – Tests + polish
  - [x] Add unit tests for SM-2 edge cases
  - [x] Add parser/writer round-trip tests on sample markdown
  - [x] Add CardStore tests for `getDueCards` and `getNewCards`
  - [x] Add UX polish: `ink-spinner` for loading, `ink-markdown` for content
  - [ ] Add hints/help text on screens

- [ ] Phase 10 – Packaging + docs
  - [ ] Fill `package.json` (`bin`, scripts)
  - [ ] Add `README.md` explaining install, config, usage, format
  - [ ] Ensure CLI shebang and executability
  - [ ] Document optional `npm publish` steps
