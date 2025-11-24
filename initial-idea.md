Perfect! Now I have a solid understanding of the SM-2 algorithm. Let me create a comprehensive analysis document for you:

# drill Deep Analysis for JavaScript/Ink Implementation

Based on my analysis of the drill repository and spaced repetition algorithms, here's a comprehensive breakdown:

## 1. Core Data Structures

### Card Model
```javascript
// Card data structure (from card.go analysis and markdown format)
const Card = {
  // Identity
  id: String,              // Unique identifier (typically filename or UUID)
  title: String,           // Card title (from # heading)
  filePath: String,        // Path to markdown file
  deckName: String,        // Parent deck name (directory name)
  
  // Content
  question: String,        // Content under ## Question section
  answer: String,          // Content under ## Answer section
  
  // Metadata (YAML frontmatter)
  tags: Array<String>,     // Categories/topics
  created: Date,           // Creation timestamp (YYYY-MM-DD)
  lastReviewed: Date,      // Last review timestamp
  nextReview: Date,        // Calculated next review date
  
  // SM-2 Algorithm Fields
  reviewInterval: Number,   // Days until next review (default: 0)
  easeFactor: Number,       // Difficulty multiplier (default: 2.5, min: 1.3)
  repetitionCount: Number,  // Successful reviews in a row (default: 0)
  difficulty: Number        // User perception 0-5 (optional, for stats)
}
```

### Deck Model
```javascript
const Deck = {
  name: String,             // Directory name
  path: String,             // Full directory path
  cards: Array<Card>,       // All cards in deck
  totalCards: Number,       // Card count
  dueCards: Number,         // Cards due today
  newCards: Number,         // Never reviewed cards
  learningCards: Number     // Cards in learning phase
}
```

## 2. File Format Structure

### Markdown File Template
```markdown
---
tags: [tag1, tag2, tag3]
created: 2025-04-02
last_reviewed: 2025-11-20
review_interval: 7
easeFactor: 2.6
repetitionCount: 3
difficulty: 4
---

# Card Title

## Question

Your question content here.
Can be multiline with **markdown** formatting.

## Answer

Your answer here with:
- Lists
- Code blocks
- Tables
- Any markdown content
```

### Parsing Strategy
1. **Split frontmatter from content** (between `---` markers)
2. **Parse YAML** to extract metadata fields
3. **Extract sections** by finding `## Question` and `## Answer` headers
4. **Parse title** from first `#` heading
5. **Preserve markdown** for rich rendering

## 3. SM-2 Spaced Repetition Algorithm

### Core Algorithm Implementation

```javascript
/**
 * SM-2 Algorithm for calculating next review
 * @param {Card} card - Current card state
 * @param {Number} quality - User rating 0-5
 * @returns {Object} Updated { interval, repetitions, easeFactor, nextReview }
 */
function calculateSM2(card, quality) {
  // Validate quality (0-5 scale)
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }
  
  // Get current values (with defaults for new cards)
  let repetitions = card.repetitionCount || 0;
  let easeFactor = card.easeFactor || 2.5;
  let interval = card.reviewInterval || 0;
  
  // Step 1: Update ease factor based on quality
  // Formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ensure ease factor never goes below 1.3
  easeFactor = Math.max(1.3, easeFactor);
  
  // Step 2: Update repetition count
  if (quality < 3) {
    // Failed recall - reset to beginning
    repetitions = 0;
    interval = 0;
  } else {
    // Successful recall - increment
    repetitions += 1;
  }
  
  // Step 3: Calculate new interval based on repetition count
  if (repetitions === 0) {
    interval = 0; // Review immediately
  } else if (repetitions === 1) {
    interval = 1; // Review tomorrow
  } else if (repetitions === 2) {
    interval = 6; // Review in 6 days
  } else {
    // For subsequent reviews, multiply previous interval by ease factor
    interval = Math.round(interval * easeFactor);
  }
  
  // Step 4: Calculate next review date
  const now = new Date();
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  
  return {
    interval,
    repetitions,
    easeFactor,
    nextReview
  };
}
```

### Quality Rating Scale (1-5 in drill, 0-5 in SM-2)

```javascript
const QUALITY_RATINGS = {
  1: 'Blackout',           // Complete failure (SM-2: 0)
  2: 'Wrong',              // Incorrect but recognized (SM-2: 1-2)
  3: 'Hard',               // Correct with difficulty (SM-2: 3)
  4: 'Good',               // Correct with some effort (SM-2: 4)
  5: 'Easy'                // Perfect recall (SM-2: 5)
};

// drill uses 1-5, but you'll need to map to 0-5 internally
// or adjust the algorithm formulas accordingly
```

### Algorithm Behavior Patterns

1. **New cards** (repetitions = 0):
   - First review: 1 day interval
   - Second review: 6 days interval
   - Subsequent: exponential growth based on ease factor

2. **Failed cards** (quality < 3):
   - Reset repetitions to 0
   - Start learning cycle over
   - Ease factor decreases (makes future intervals shorter)

3. **Successful cards** (quality ≥ 3):
   - Increment repetitions
   - Interval grows exponentially
   - Ease factor adjusts based on difficulty

4. **Ease factor dynamics**:
   - Quality 5 (Easy): EF increases by ~0.1
   - Quality 4 (Good): EF stays roughly same
   - Quality 3 (Hard): EF decreases by ~0.14
   - Quality 1-2: EF decreases significantly

## 4. Data Store Architecture

### File System Structure
```
~/drill/
├── programming/           # Deck (directory)
│   ├── algorithms.md     # Card
│   ├── data-structures.md
│   └── patterns.md
├── languages/            # Another deck
│   ├── spanish-basics.md
│   └── french-verbs.md
└── history/
    └── world-war-2.md
```

### Store Operations

```javascript
class CardStore {
  constructor(baseDir) {
    this.baseDir = baseDir; // e.g., ~/drill
    this.decks = new Map();
  }
  
  // Load all decks from filesystem
  async loadDecks() {
    // 1. Read directories in baseDir
    // 2. For each directory, create Deck object
    // 3. Read all .md files in directory
    // 4. Parse each markdown file into Card
    // 5. Store in this.decks Map
  }
  
  // Get cards due for review today
  getDueCards(deckName = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    // Filter cards where nextReview <= today
    // If deckName specified, filter by deck
    // Sort by nextReview (oldest first)
  }
  
  // Get new cards (never reviewed)
  getNewCards(deckName = null) {
    // Filter cards where repetitionCount === 0
    // and lastReviewed is null/undefined
  }
  
  // Save card after review
  async saveCard(card) {
    // 1. Construct markdown with updated frontmatter
    // 2. Write to card.filePath
    // 3. Update in-memory deck
  }
  
  // Get statistics
  getStats(deckName = null) {
    // Calculate:
    // - Total cards
    // - Due today
    // - New cards
    // - Learning cards (repetitionCount < 3)
    // - Mature cards (repetitionCount >= 3)
    // - Retention rate
  }
}
```

### Markdown Parser

```javascript
function parseMarkdownCard(filePath, content) {
  // 1. Split by frontmatter delimiters (---)
  const parts = content.split(/^---$/m);
  
  // 2. Parse YAML frontmatter
  const frontmatter = yaml.parse(parts[1]);
  
  // 3. Extract content sections
  const bodyContent = parts[2];
  
  // 4. Find title (first # heading)
  const titleMatch = bodyContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';
  
  // 5. Extract Question section
  const questionMatch = bodyContent.match(/##\s+Question\s*\n([\s\S]*?)(?=##|$)/);
  const question = questionMatch ? questionMatch[1].trim() : '';
  
  // 6. Extract Answer section
  const answerMatch = bodyContent.match(/##\s+Answer\s*\n([\s\S]*?)$/);
  const answer = answerMatch ? answerMatch[1].trim() : '';
  
  return {
    id: path.basename(filePath, '.md'),
    filePath,
    title,
    question,
    answer,
    tags: frontmatter.tags || [],
    created: new Date(frontmatter.created),
    lastReviewed: frontmatter.last_reviewed ? new Date(frontmatter.last_reviewed) : null,
    reviewInterval: frontmatter.review_interval || 0,
    easeFactor: frontmatter.easeFactor || 2.5,
    repetitionCount: frontmatter.repetitionCount || 0,
    nextReview: calculateNextReview(frontmatter)
  };
}
```

### Markdown Writer

```javascript
function serializeCard(card) {
  // 1. Build YAML frontmatter
  const frontmatter = {
    tags: card.tags,
    created: formatDate(card.created),
    last_reviewed: card.lastReviewed ? formatDate(card.lastReviewed) : null,
    review_interval: card.reviewInterval,
    easeFactor: card.easeFactor,
    repetitionCount: card.repetitionCount
  };
  
  const yaml = stringifyYAML(frontmatter);
  
  // 2. Build markdown body
  const markdown = `---
${yaml}---

# ${card.title}

## Question

${card.question}

## Answer

${card.answer}
`;
  
  return markdown;
}
```

## 5. UI Architecture for Ink

### Screen Flow
```
Main Menu
├─> Study Session (due cards)
├─> Browse Decks
│   └─> Deck Detail
│       └─> Study Deck
└─> Statistics
    ├─> Summary View
    ├─> Deck Review
    └─> Review Forecast
```

### Key Ink Components

```javascript
// Main App Component
function App() {
  const [screen, setScreen] = useState('main-menu');
  const [store, setStore] = useState(null);
  
  useEffect(() => {
    // Load decks on mount
    const cardStore = new CardStore(config.baseDir);
    await cardStore.loadDecks();
    setStore(cardStore);
  }, []);
  
  // Route to different screens
  switch (screen) {
    case 'main-menu':
      return <MainMenu />;
    case 'study':
      return <StudyScreen />;
    case 'browse':
      return <BrowseDecks />;
    case 'stats':
      return <StatsScreen />;
  }
}

// Study Screen Component
function StudyScreen({ deck, store }) {
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dueCards, setDueCards] = useState([]);
  
  useInput((input, key) => {
    if (input === ' ' && !showAnswer) {
      setShowAnswer(true);
    }
    
    if (showAnswer && input >= '1' && input <= '5') {
      handleRating(parseInt(input));
    }
    
    if (input === 'q') {
      exit();
    }
  });
  
  const handleRating = async (quality) => {
    // Calculate SM-2 update
    const updated = calculateSM2(currentCard, quality);
    
    // Update card
    currentCard.reviewInterval = updated.interval;
    currentCard.repetitionCount = updated.repetitions;
    currentCard.easeFactor = updated.easeFactor;
    currentCard.nextReview = updated.nextReview;
    currentCard.lastReviewed = new Date();
    
    // Save to file
    await store.saveCard(currentCard);
    
    // Move to next card
    loadNextCard();
    setShowAnswer(false);
  };
  
  return (
    <Box flexDirection="column">
      <Text bold>{currentCard.title}</Text>
      <Box marginTop={1}>
        <Text>{currentCard.question}</Text>
      </Box>
      
      {showAnswer && (
        <Box marginTop={1}>
          <Text color="green">{currentCard.answer}</Text>
          <Box marginTop={1}>
            <Text>Rate your recall: [1] Blackout [2] Wrong [3] Hard [4] Good [5] Easy</Text>
          </Box>
        </Box>
      )}
      
      {!showAnswer && (
        <Box marginTop={1}>
          <Text color="gray">Press SPACE to reveal answer</Text>
        </Box>
      )}
    </Box>
  );
}
```

## 6. Key JavaScript Libraries

### Required Dependencies

```json
{
  "dependencies": {
    "ink": "^4.0.0",               // Terminal UI framework
    "ink-markdown": "^1.0.0",      // Markdown rendering in Ink
    "react": "^18.0.0",            // Required by Ink
    "yaml": "^2.0.0",              // YAML parsing for frontmatter
    "gray-matter": "^4.0.0",       // Frontmatter extraction (alternative)
    "date-fns": "^3.0.0",          // Date manipulation
    "glob": "^10.0.0",             // File pattern matching
    "ink-text-input": "^5.0.0",    // Text input component
    "ink-select-input": "^5.0.0",  // Selection lists
    "ink-spinner": "^5.0.0"        // Loading indicators
  }
}
```

## 7. Project Structure

```
gocard-js/
├── src/
│   ├── index.js              # CLI entry point
│   ├── models/
│   │   ├── Card.js           # Card class
│   │   └── Deck.js           # Deck class
│   ├── store/
│   │   ├── CardStore.js      # File system operations
│   │   ├── parser.js         # Markdown parsing
│   │   └── writer.js         # Markdown serialization
│   ├── srs/
│   │   └── sm2.js            # SM-2 algorithm
│   ├── ui/
│   │   ├── App.js            # Main Ink app
│   │   ├── MainMenu.js       # Main menu screen
│   │   ├── StudyScreen.js    # Study interface
│   │   ├── BrowseDecks.js    # Deck browser
│   │   └── StatsScreen.js    # Statistics view
│   └── utils/
│       ├── config.js         # Configuration
│       └── dates.js          # Date helpers
├── package.json
└── README.md
```

## 8. Implementation Checklist

### Phase 1: Core Functionality
- [ ] Implement Card and Deck models
- [ ] Build markdown parser (frontmatter + sections)
- [ ] Build markdown writer (serialize cards)
- [ ] Implement CardStore (file operations)
- [ ] Implement SM-2 algorithm

### Phase 2: Basic UI
- [ ] Create Main Menu with Ink
- [ ] Build Study Screen (show question → answer → rating)
- [ ] Implement keyboard shortcuts
- [ ] Add markdown rendering in terminal

### Phase 3: Advanced Features
- [ ] Deck browser
- [ ] Statistics screens (summary, deck review, forecast)
- [ ] Configuration management
- [ ] Error handling and validation

### Phase 4: Polish
- [ ] Add loading states
- [ ] Improve markdown rendering (code highlighting)
- [ ] Add help screens
- [ ] Write tests
- [ ] Documentation

## 9. Critical Implementation Details

### Date Handling
- Store dates in ISO format (YYYY-MM-DD) in frontmatter
- Calculate "due" by comparing `nextReview` to current date (start of day)
- Update `lastReviewed` to current date after each review

### File Watching (Optional Enhancement)
- Watch markdown files for external changes
- Reload decks when files modified
- Useful for Git-based workflows

### Performance Considerations
- Cache parsed cards in memory
- Only re-parse files when modified
- Use async I/O for all file operations

### SM-2 Edge Cases
- Minimum ease factor: 1.3 (prevents intervals from becoming too short)
- Quality < 3: Reset repetitions but keep ease factor change
- First two intervals are fixed (1 day, 6 days)

## 10. Example Usage Flow

```bash
# Install
npm install -g gocard-js

# Initialize
mkdir ~/drill
gocard-js --dir ~/drill

# Screens flow:
# 1. Main Menu → Select "Study"
# 2. Study Screen → Shows due card question
# 3. Press SPACE → Reveals answer
# 4. Press 1-5 → Rate difficulty, moves to next card
# 5. When done → Back to main menu
# 6. Browse Decks → See all decks and stats
# 7. Statistics → View learning progress
```

***

This should give you everything you need to build a faithful JavaScript/Ink implementation of drill! The key is maintaining the same file format (markdown + YAML frontmatter), implementing the SM-2 algorithm correctly, and building a clean Ink-based interface. Would you like me to elaborate on any specific section?

Sources
[1] GitHub - DavidMiserak/drill: A lightweight file-based spaced repetition system (SRS) that uses plain Markdown files for flashcards. Perfect for developers who prefer text files, Git version control, and keyboard-driven interfaces. https://github.com/DavidMiserak/drill
[2] The Anki SM-2 Spaced Repetition Algorithm https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm
[3] thyagoluciano/sm2: SM-2 is a simple spaced repetition ... https://github.com/thyagoluciano/sm2
[4] Spaced Repetition Algorithm: A Three‐Day Journey from ... https://www.reddit.com/r/Anki/comments/17u01ge/spaced_repetition_algorithm_a_threeday_journey/
[5] java - Spaced repetition algorithm from SuperMemo (SM-2) https://stackoverflow.com/questions/49047159/spaced-repetition-algorithm-from-supermemo-sm-2
[6] SuperMemo https://en.wikipedia.org/wiki/SuperMemo
[7] The best spaced repetition time intervals according ... - Traverse https://traverse.link/spaced-repetition/the-optimal-spaced-repetition-schedule
[8] FSRS vs SM2: How Spaced Repetition Algorithms Work https://www.youtube.com/watch?v=v2asudkSFek
[9] A-Factor https://supermemo.guru/wiki/A-Factor
[10] Spaced repetition algorithm metric https://supermemopedia.com/wiki/Spaced_repetition_algorithm_metric

