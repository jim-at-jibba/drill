# UI Improvements Plan

Based on the design mockups, implement the following enhancements:

## Browse Decks Screen
- [ ] Add table layout with columns: DECK NAME, CARDS, DUE, LAST STUDIED
- [ ] Show "Page X of Y" pagination info
- [ ] Display last studied date per deck (track in deck metadata)
- [ ] Add comprehensive help footer: `↑/↓: Navigate  Enter: Study  b: Back  n/p: Next/Prev Page  q: Quit`
- [ ] Consider pagination if many decks (>10)

## Study Screen
- [ ] Add header bar showing: `Studying: {deck} Card {current}/{total}`
- [ ] Add colored rating buttons at bottom:
  - Purple: Blackout (1)
  - Red: Wrong (2)
  - Orange: Hard (3)
  - Orange-yellow: Good (4)
  - Teal: Easy (5)
- [ ] Show both question and answer simultaneously (no toggle)
- [ ] Add help footer: `1-5: Rate Card  j/k: Scroll  b: Back to Decks  q: Quit`
- [ ] Add visual separator/divider between question and answer sections
- [ ] Consider adding scroll support with j/k for long content

## Statistics Screen
- [ ] Add tabbed navigation: `Summary | Deck Review | Review Forecast`
- [ ] Summary tab:
  - Total Cards count
  - Cards Due Today count
  - Studied Today count
  - Retention Rate percentage
  - Cards Studied per Day chart (bar chart by date)
- [ ] Deck Review tab (future):
  - Per-deck breakdown with detailed stats
- [ ] Review Forecast tab (future):
  - Future due counts forecast
- [ ] Add help footer: `Tab: Switch View  b: Back to Main Menu  q: Quit`

## General Improvements
- [ ] Track study sessions with timestamps for "Studied Today" stat
- [ ] Track last studied date per deck for Browse view
- [ ] Implement retention rate calculation
- [ ] Add study history tracking for charts
- [ ] Implement j/k scroll navigation where needed
- [ ] Consistent help footer across all screens
- [ ] Consider adding ink-box or similar for better table rendering

## Implementation Priority
1. Study screen improvements (most used)
2. Browse decks table layout
3. Statistics summary with basic stats
4. Study history tracking
5. Charts and advanced stats
