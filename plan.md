# drill implementation plan

- [x] Phase 0 – Repo + scaffolding
  - [x] Init npm project, add deps (Ink v5, React, yaml, etc.)
  - [x] Create `src/`, `models/`, `store/`, `srs/`, `ui/`, `utils/`
  - [x] Add basic `src/index.js` CLI entry using `ink` `render`
  - [x] Add simple config loader `utils/config.js` (base dir, defaults to `~/drill`)

- [ ] Phase 1 – Core models
  - [ ] Implement `models/Card.js` with fields from doc
  - [ ] Add constructor + static `fromParsedMarkdown(...)`
  - [ ] Add `serialize()` on Card delegating to writer util
  - [ ] Implement `models/Deck.js` with counts + helper methods
  - [ ] Implement `Deck.getDueCards()`, `getNewCards()`, `getStats()`

- [ ] Phase 2 – Markdown parsing/writing
  - [ ] Implement `store/parser.js` with `parseMarkdownCard(filePath, content)`
  - [ ] Split frontmatter, parse YAML, extract title/Question/Answer via regex
  - [ ] Compute `nextReview` via `calculateNextReview(frontmatter)` helper
  - [ ] Implement `store/writer.js` with `serializeCard(card)`
  - [ ] Build frontmatter and markdown body per spec
  - [ ] Implement `utils/dates.js` (`formatDate`, `startOfToday`, `addDays`, `isDue`)

- [ ] Phase 3 – CardStore + filesystem
  - [ ] Implement `store/CardStore.js` ctor `(baseDir)` and `this.decks = new Map()`
  - [ ] Implement `loadDecks()` walking dirs under baseDir, reading `.md` files
  - [ ] For each file, `parseMarkdownCard`, attach `deckName`, push into deck
  - [ ] After loading, compute per-deck counts (total, due, new, learning)
  - [ ] Implement `getDueCards(deckName?)` using `startOfToday()` and sort by `nextReview`
  - [ ] Implement `getNewCards(deckName?)` using `repetitionCount` and `lastReviewed`
  - [ ] Implement `saveCard(card)` to write markdown and update cache
  - [ ] Implement `getStats(deckName?)` for total/due/new/learning/mature/retention

- [ ] Phase 4 – SM-2 algorithm
  - [ ] Implement `srs/sm2.js` with `calculateSM2(card, quality1to5)`
  - [ ] Validate quality, map 1–5 to 0–5 if needed
  - [ ] Apply EF formula with min 1.3 and interval rules (0,1,6, then `round(prev * EF)`)
  - [ ] Compute `nextReview` using `addDays`
  - [ ] Export `QUALITY_RATINGS` table matching doc comments
  - [ ] Implement `calculateNextReview(frontmatter)` helper

- [ ] Phase 5 – Ink UI: foundation
  - [ ] Implement `ui/App.js` with `screen` state and `store` state
  - [ ] On mount, create `CardStore(config.baseDir)` and `await loadDecks()`
  - [ ] Render `MainMenu`, `StudyScreen`, `BrowseDecks`, `StatsScreen` via switch
  - [ ] Implement `ui/MainMenu.js` with counts and menu options
  - [ ] Wire `src/index.js` to parse CLI args and render `App`

- [ ] Phase 6 – Ink UI: Study flow
  - [ ] Implement `ui/StudyScreen.js` with `currentCard`, `showAnswer`, `dueCards`
  - [ ] On mount, load due cards via `store.getDueCards(deckName)`
  - [ ] Implement `loadNextCard()` to advance through due cards
  - [ ] Implement `useInput` handling: SPACE, `1–5`, `q`
  - [ ] Implement `handleRating(quality)` calling `calculateSM2` and `store.saveCard`
  - [ ] Render question, conditional answer, and rating prompt
  - [ ] Handle empty state when no due cards

- [ ] Phase 7 – Ink UI: Browse + Stats
  - [ ] Implement `ui/BrowseDecks.js` listing decks with `ink-select-input`
  - [ ] Implement deck detail view with per-deck stats and “Study deck” action
  - [ ] Implement `ui/StatsScreen.js` with global stats summary
  - [ ] Optionally add simple forecast of future due counts

- [ ] Phase 8 – Config, error handling, performance
  - [ ] Implement `utils/config.js` resolving base dir from CLI/env
  - [ ] Ensure base dir exists or show friendly error
  - [ ] Wrap fs operations with try/catch and user-facing error messages
  - [ ] Skip malformed markdown/frontmatter with warnings
  - [ ] Keep deck + card cache in `CardStore`
  - [ ] Optionally expose `reload()` to re-scan filesystem
  - [ ] Optionally add `fs.watch`-based auto-reload

- [ ] Phase 9 – Tests + polish
  - [ ] Add unit tests for SM-2 edge cases
  - [ ] Add parser/writer round-trip tests on sample markdown
  - [ ] Add CardStore tests for `getDueCards` and `getNewCards`
  - [ ] Add UX polish: `ink-spinner` for loading, `ink-markdown` for content
  - [ ] Add hints/help text on screens

- [ ] Phase 10 – Packaging + docs
  - [ ] Fill `package.json` (`bin`, scripts)
  - [ ] Add `README.md` explaining install, config, usage, format
  - [ ] Ensure CLI shebang and executability
  - [ ] Document optional `npm publish` steps
