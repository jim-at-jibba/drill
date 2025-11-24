import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { CardStore } from '../store/CardStore.js';

interface StatsScreenProps {
  store: CardStore;
  onExit: () => void;
}

type Tab = 'summary' | 'deck-review' | 'forecast';

export const StatsScreen: React.FC<StatsScreenProps> = ({ store, onExit }) => {
  const [currentTab, setCurrentTab] = useState<Tab>('summary');
  const stats = store.getStats();

  useInput((input, key) => {
    if (input === 'q' || input === 'b') {
      onExit();
      return;
    }

    if (key.tab || input === 't') {
      // Cycle through tabs
      if (currentTab === 'summary') setCurrentTab('deck-review');
      else if (currentTab === 'deck-review') setCurrentTab('forecast');
      else setCurrentTab('summary');
    }

    // Also allow number keys to switch tabs
    if (input === '1') setCurrentTab('summary');
    if (input === '2') setCurrentTab('deck-review');
    if (input === '3') setCurrentTab('forecast');
  });

  const getTodayStudied = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let count = 0;
    for (const deck of store.decks.values()) {
      for (const card of deck.cards) {
        if (card.lastReviewed) {
          const reviewDate = new Date(card.lastReviewed);
          reviewDate.setHours(0, 0, 0, 0);
          if (reviewDate.getTime() === today.getTime()) {
            count++;
          }
        }
      }
    }
    return count;
  };

  const getRetentionRate = (): number => {
    let totalReviewed = 0;
    let successful = 0;
    
    for (const deck of store.decks.values()) {
      for (const card of deck.cards) {
        if (card.repetitionCount > 0) {
          totalReviewed++;
          // Consider successful if repetitionCount >= 2 (passed at least twice)
          if (card.repetitionCount >= 2) {
            successful++;
          }
        }
      }
    }
    
    return totalReviewed > 0 ? Math.round((successful / totalReviewed) * 100) : 0;
  };

  const renderSummary = () => {
    const todayStudied = getTodayStudied();
    const retentionRate = getRetentionRate();

    return (
      <>
        <Box gap={2} marginBottom={1}>
          <Box flexDirection="column">
            <Text>Total Cards:</Text>
            <Text bold>{stats.totalCards}</Text>
          </Box>
          <Box flexDirection="column">
            <Text>Cards Due Today:</Text>
            <Text bold>{stats.dueCards}</Text>
          </Box>
          <Box flexDirection="column">
            <Text>Studied Today:</Text>
            <Text bold>{todayStudied}</Text>
          </Box>
          <Box flexDirection="column">
            <Text>Retention Rate:</Text>
            <Text bold>{retentionRate}%</Text>
          </Box>
        </Box>

        <Box marginTop={1} marginBottom={1}>
          <Text bold>Cards Studied per Day</Text>
        </Box>

        {todayStudied > 0 ? (
          <Box>
            <Text dimColor>Nov 24  </Text>
            <Box borderStyle="round" borderColor="blue" width={todayStudied * 2 + 2} paddingX={1}>
              <Text> </Text>
            </Box>
            <Text> {todayStudied}</Text>
          </Box>
        ) : (
          <Text dimColor>No cards studied today</Text>
        )}
      </>
    );
  };

  const renderDeckReview = () => {
    // Find most recently studied deck
    let mostRecentDeck = null;
    let mostRecentTime = 0;
    
    for (const deck of store.decks.values()) {
      if (deck.lastStudied) {
        const time = deck.lastStudied.getTime();
        if (time > mostRecentTime) {
          mostRecentTime = time;
          mostRecentDeck = deck;
        }
      }
    }

    if (!mostRecentDeck) {
      return <Text dimColor>No decks studied yet</Text>;
    }

    const deckStats = mostRecentDeck.getStats();
    
    // Calculate rating distribution for cards reviewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const ratingCounts = [0, 0, 0, 0, 0]; // indices 0-4 for ratings 1-5
    let todayReviewCount = 0;
    
    for (const card of mostRecentDeck.cards) {
      if (card.lastReviewed) {
        const reviewDate = new Date(card.lastReviewed);
        reviewDate.setHours(0, 0, 0, 0);
        if (reviewDate.getTime() === today.getTime()) {
          todayReviewCount++;
          // difficulty field stores the rating directly (1-5)
          const rating = card.difficulty !== null ? Math.max(1, Math.min(5, Math.round(card.difficulty))) : 3;
          ratingCounts[rating - 1]++;
        }
      }
    }

    const maxCount = Math.max(...ratingCounts, 1);

    return (
      <Box flexDirection="column">
        <Text bold>{mostRecentDeck.name}</Text>
        <Box marginTop={1} gap={3}>
          <Text dimColor>Total: {deckStats.totalCards}</Text>
          <Text dimColor>Due: {deckStats.dueCards}</Text>
          <Text dimColor>New: {deckStats.newCards}</Text>
          <Text dimColor>Learning: {deckStats.learningCards}</Text>
          <Text dimColor>Mature: {deckStats.matureCards}</Text>
        </Box>

        <Box marginTop={2} flexDirection="column">
          <Text bold>Ratings Today ({todayReviewCount} cards)</Text>
          {todayReviewCount > 0 ? (
            <Box marginTop={1} flexDirection="column">
              {[1, 2, 3, 4, 5].map((rating) => {
                const count = ratingCounts[rating - 1];
                const barWidth = maxCount > 0 ? Math.round((count / maxCount) * 20) : 0;
                const colors = ['magenta', 'red', 'yellow', 'green', 'cyan'];
                
                return (
                  <Box key={rating}>
                    <Text>{rating}: </Text>
                    <Text color={colors[rating - 1]}>{'█'.repeat(barWidth)}</Text>
                    <Text> {count}</Text>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box marginTop={1}>
              <Text dimColor>No cards reviewed today</Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderForecast = () => {
    // Calculate next 7 days of due cards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const forecast: Array<{ date: Date; newCards: number; reviewCards: number }> = [];
    
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      targetDate.setHours(0, 0, 0, 0);
      
      let newCards = 0;
      let reviewCards = 0;
      
      for (const deck of store.decks.values()) {
        for (const card of deck.cards) {
          if (card.nextReview) {
            const nextReviewDate = new Date(card.nextReview);
            nextReviewDate.setHours(0, 0, 0, 0);
            
            if (nextReviewDate.getTime() === targetDate.getTime()) {
              if (card.repetitionCount === 0) {
                newCards++;
              } else {
                reviewCards++;
              }
            }
          }
        }
      }
      
      forecast.push({ date: targetDate, newCards, reviewCards });
    }
    
    const maxTotal = Math.max(...forecast.map(f => f.newCards + f.reviewCards), 1);
    const maxBarWidth = 30;

    return (
      <Box flexDirection="column">
        <Text bold>Next 7 Days</Text>
        <Box marginTop={1} flexDirection="column">
          {forecast.map((day, idx) => {
            const total = day.newCards + day.reviewCards;
            const newWidth = maxTotal > 0 ? Math.round((day.newCards / maxTotal) * maxBarWidth) : 0;
            const reviewWidth = maxTotal > 0 ? Math.round((day.reviewCards / maxTotal) * maxBarWidth) : 0;
            
            const dateStr = idx === 0 ? 'Today' : 
                           idx === 1 ? 'Tomorrow' : 
                           day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <Box key={idx} marginBottom={idx < 6 ? 0 : 0}>
                <Box width={10}>
                  <Text>{dateStr}</Text>
                </Box>
                <Text color="cyan">{'█'.repeat(reviewWidth)}</Text>
                <Text color="green">{'█'.repeat(newWidth)}</Text>
                <Text> {total}</Text>
              </Box>
            );
          })}
        </Box>
        
        <Box marginTop={1} gap={2}>
          <Box>
            <Text color="cyan">█</Text>
            <Text> Review</Text>
          </Box>
          <Box>
            <Text color="green">█</Text>
            <Text> New</Text>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Statistics</Text>
      </Box>

      {/* Tabs */}
      <Box gap={2} marginBottom={1}>
        <Text bold={currentTab === 'summary'} underline={currentTab === 'summary'}>
          Summary
        </Text>
        <Text bold={currentTab === 'deck-review'} underline={currentTab === 'deck-review'} dimColor={currentTab !== 'deck-review'}>
          Deck Review
        </Text>
        <Text bold={currentTab === 'forecast'} underline={currentTab === 'forecast'} dimColor={currentTab !== 'forecast'}>
          Review Forecast
        </Text>
      </Box>

      {/* Tab content */}
      <Box flexDirection="column" marginBottom={1}>
        {currentTab === 'summary' && renderSummary()}
        {currentTab === 'deck-review' && renderDeckReview()}
        {currentTab === 'forecast' && renderForecast()}
      </Box>

      {/* Help footer */}
      <Box marginTop={1}>
        <Text dimColor>Tab: Switch View    b: Back to Main Menu    q: Quit</Text>
      </Box>
    </Box>
  );
};
