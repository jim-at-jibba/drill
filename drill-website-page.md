---
layout: ../../layouts/ProjectLayout.astro
title: "drill :: Terminal-Based Spaced Repetition System"
description: A file-based flashcard system using Markdown and the SM-2 algorithm. Study in the terminal with Git version control and keyboard-driven interfaces.
tags: ["cli", "terminal", "learning", "markdown", "spaced-repetition"]
timestamp: 2025-12-31T00:00:00+00:00
featured: true
filename: drill
---

## drill

### File-Based Spaced Repetition for Terminal Enthusiasts

drill is a terminal-based flashcard system that brings spaced repetition to developers who prefer text files and keyboard-driven workflows. Store flashcards as plain Markdown files, study with an intuitive terminal UI, and track progress using the proven SM-2 algorithm. No database, no cloud sync, no GUI - just Markdown files, Git, and your terminal.

[View on GitHub](https://github.com/jim-at-jibba/drill)

## The Problem

Traditional flashcard apps lock your data in proprietary formats and require GUI applications. Developers want their learning materials version-controlled, syncable via Git, and editable in their preferred text editor. drill solves this by treating flashcards as plain Markdown files while still providing the sophisticated scheduling of apps like Anki.

## Key Features

### Plain Text Architecture

drill embraces the Unix philosophy:

- Flashcards as Markdown files with YAML frontmatter
- No database - works with any text editor
- Directory-based deck organization
- Full Git integration for version control
- Sync anywhere files sync (Dropbox, iCloud, Git)
- Backup-friendly and future-proof

### Proven Spaced Repetition

Intelligent scheduling using the SM-2 algorithm:

- Same algorithm powering Anki's success
- Optimal review intervals based on difficulty
- Five-point rating scale (Blackout to Easy)
- Automatic ease factor adjustment
- New card progression: 1 day, 6 days, then exponential
- Smart reset for failed cards

### Terminal-First Experience

Fast keyboard-driven interface built with Ink:

- React-based terminal UI with smooth rendering
- Arrow key navigation, number key ratings
- Real-time progress tracking during sessions
- Deck browser with statistics
- Review forecast and retention metrics
- Syntax-highlighted code blocks in cards

### Developer Workflow Integration

Designed for how developers work:

- Optional auto-commit after study sessions
- Custom card directory via CLI flag or env var
- Configurable logging levels (DEBUG, INFO, WARN)
- Markdown support including code blocks
- Tag-based card organization
- TypeScript codebase with comprehensive tests

## Technical Implementation

drill leverages modern JavaScript ecosystem tools:

- Ink for React-based terminal rendering
- gray-matter for YAML frontmatter parsing
- date-fns for date calculations and scheduling
- glob for recursive file discovery
- Vitest for comprehensive test coverage
- TypeScript for type safety and developer experience

### Architecture Highlights

What makes drill's architecture clean and maintainable:

- **Separation of Concerns** - Models, store, SRS, and UI cleanly separated
- **File-Based Store** - CardStore handles all filesystem operations
- **Pure SM-2 Logic** - Algorithm isolated in srs/sm2.ts with extensive tests
- **React Components** - Modular UI components for each screen
- **Parser/Writer Split** - Bidirectional Markdown conversion
- **Validation Layer** - Card format validation with helpful error messages

## User Workflow

### Creating Flashcards

1. **Create Directory** - Set up deck folder in `~/drill`
2. **Write Markdown** - Create `.md` files with YAML frontmatter
3. **Add Content** - Title, question, and answer sections
4. **Start Studying** - drill manages scheduling automatically

### Study Session

1. **Launch** - Run `drill` command in terminal
2. **Select Deck** - Choose "Study" or browse specific deck
3. **Review Cards** - Question shown, press key to reveal answer
4. **Rate Difficulty** - Press 1-5 based on recall quality
5. **Complete** - Session ends when no cards due

### Progress Tracking

1. **Statistics** - View total cards, due counts, maturity levels
2. **Deck Breakdown** - Per-deck progress and review stats
3. **Review Forecast** - See upcoming review load by day
4. **Git History** - Track learning over time via commits

## Card Format

### Structure

Flashcards consist of three parts:

- **Frontmatter** - YAML metadata for spaced repetition
- **Title** - Main heading identifying the card
- **Sections** - Question and Answer markdown content

### Example Card

```markdown
---
tags: [algorithms, search]
created: 2025-01-15
last_reviewed: 2025-01-22
review_interval: 15
easeFactor: 2.6
repetitionCount: 3
difficulty: 4
---

# Binary Search

## Question

What is the time complexity of binary search?

## Answer

O(log n) - Binary search divides the search space in half with each comparison, leading to logarithmic time complexity.
```

### Metadata Fields

What each frontmatter field controls:

- **tags** - Categories for organization (manually set)
- **created** - Card creation date (manually set)
- **last_reviewed** - Last study timestamp (auto-managed)
- **review_interval** - Days until next review (calculated by SM-2)
- **easeFactor** - Difficulty multiplier (adjusted by ratings)
- **repetitionCount** - Successful consecutive reviews (auto-managed)
- **difficulty** - Last rating 1-5 (optional, for statistics)

## Configuration & Integration

### Customization Options

drill offers flexible configuration:

- Custom card directory via `--dir` flag or `DRILL_DIR` env var
- Auto-commit via `DRILL_AUTO_COMMIT=true` environment variable
- Logging control with `LOG_LEVEL` (WARN, INFO, DEBUG)
- Deck organization using filesystem directories
- Tag-based cross-cutting categorization
- Global npm installation or local development mode

### Tool Integration

Works seamlessly with developer tools:

- **Git** - Auto-commit card progress, version control learning
- **Any text editor** - Cards are plain Markdown files
- **Terminal multiplexers** - Use alongside tmux/screen
- **CI/CD** - Test card validity in pipelines
- **Sync tools** - Dropbox, iCloud, Git remotes work transparently

## Development & Roadmap

### Current Status

drill is stable and actively maintained:

- Version 0.1.1 published to npm
- Comprehensive test coverage for core logic
- TypeScript for type safety
- MIT licensed and open source
- Active development on GitHub

### Future Enhancements

Planned improvements include:

- Image support in cards using terminal graphics
- Cloze deletion card type (fill-in-the-blank)
- Import/export from Anki format
- Performance optimizations for large decks
- Plugin system for custom scheduling algorithms
- Web interface option for cross-platform access
- Enhanced statistics and learning analytics

## Why drill?

What sets drill apart from other flashcard systems:

- **Text-First** - Cards are files, not database records
- **Git-Native** - Version control your learning
- **Terminal UI** - Fast keyboard workflow, no mouse needed
- **No Lock-In** - Plain Markdown means easy migration
- **Developer-Focused** - Built by developers, for developers
- **Open Source** - ISC licensed, transparent implementation
- **Proven Algorithm** - SM-2 has decades of research backing

## Usage Examples

### Daily Study Routine

```bash
# Morning review session
drill

# Study specific deck
cd ~/drill/programming && drill

# Enable auto-commit to track progress
DRILL_AUTO_COMMIT=true drill

# Use custom directory
drill --dir ~/Documents/flashcards
```

### Card Organization

```
~/drill/
├── programming/
│   ├── algorithms.md
│   ├── data-structures.md
│   └── design-patterns.md
├── languages/
│   ├── typescript.md
│   └── rust.md
└── systems/
    ├── networking.md
    └── databases.md
```

### Git Integration

```bash
# Initialize Git tracking
cd ~/drill
git init
git config user.email "you@example.com"
git config user.name "Your Name"

# Auto-commit after each session
DRILL_AUTO_COMMIT=true drill
```

## Installation

### Global Installation

```bash
npm install -g drill-srs
drill
```

### Local Development

```bash
git clone https://github.com/jim-at-jibba/drill.git
cd drill
npm install
npm run build
npm start
```

## Learning Efficiency

### SM-2 Rating Guide

Choose ratings based on recall quality:

- **1 (Blackout)** - No memory, complete failure
- **2 (Wrong)** - Incorrect but recognized the content
- **3 (Hard)** - Correct with significant mental effort
- **4 (Good)** - Correct with some thought (target rating)
- **5 (Easy)** - Immediate perfect recall

### Optimal Study Habits

Maximize retention with these practices:

- Study daily for consistency over long sessions
- Add 5-10 new cards per day, not more
- Rate honestly - "3" if you struggled even when correct
- Use specific, focused questions per card
- Include code examples for programming concepts
- Review immediately when cards are due
