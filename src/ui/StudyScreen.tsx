import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Card } from '../models/Card.js';
import { CardStore } from '../store/CardStore.js';
import { calculateSM2 } from '../srs/sm2.js';

interface StudyScreenProps {
  store: CardStore;
  deckName?: string;
  onExit: () => void;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({ store, deckName, onExit }) => {
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadNextCard();
  }, []);

  const loadNextCard = () => {
    const due = store.getDueCards(deckName);
    const newCards = store.getNewCards(deckName);
    const cards = [...due, ...newCards];
    setDueCards(cards);
    setCurrentIndex(0);
    setShowAnswer(false);
    
    if (cards.length > 0) {
      setCurrentCard(cards[0]);
    } else {
      setCurrentCard(null);
    }
  };

  const handleRating = async (quality: number) => {
    if (!currentCard) return;

    const result = calculateSM2(currentCard, quality);
    
    // Update card with SM2 result
    const updated = new Card({
      ...currentCard,
      lastReviewed: new Date(),
      nextReview: result.nextReview,
      reviewInterval: result.interval,
      easeFactor: result.easeFactor,
      repetitionCount: result.repetitions,
      lastRating: quality, // Store the rating (1-5) for statistics
    });
    
    await store.saveCard(updated);
    setReviewed(reviewed + 1);
    
    // Move to next card
    const nextIndex = currentIndex + 1;
    setShowAnswer(false);
    if (nextIndex < dueCards.length) {
      setCurrentIndex(nextIndex);
      setCurrentCard(dueCards[nextIndex]);
    } else {
      setCurrentCard(null);
    }
  };

  useInput((input) => {
    if (input === 'q') {
      onExit();
      return;
    }

    if (input === 'b') {
      onExit();
      return;
    }

    if (!currentCard) return;

    if (input === ' ') {
      setShowAnswer(true);
      return;
    }

    if (showAnswer && ['1', '2', '3', '4', '5'].includes(input)) {
      handleRating(parseInt(input, 10));
    }
  });

  if (!currentCard) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="green">
          🎉 All done! No cards due.
        </Text>
        <Text dimColor>Reviewed: {reviewed}</Text>
        <Box marginTop={1}>
          <Text dimColor>Press 'q' to return to menu</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold>
          Studying: <Text color="cyan">{deckName || 'All decks'}</Text>
          {' '}Card <Text color="yellow">{currentIndex + 1}/{dueCards.length}</Text>
        </Text>
      </Box>

      {/* Blue separator bar */}
      <Box borderStyle="round" borderColor="blue" paddingX={1}>
        <Text> </Text>
      </Box>

      {/* Question */}
      <Box paddingY={1} paddingX={2}>
        <Text color="blue">{currentCard.question}</Text>
      </Box>

      {/* Answer or prompt */}
      {showAnswer ? (
        <>
          <Box paddingY={1} paddingX={2} marginBottom={1}>
            <Text>{currentCard.answer}</Text>
          </Box>

          {/* Rating buttons */}
          <Box marginBottom={1} gap={1}>
            <Box borderStyle="round" borderColor="magenta" paddingX={1}>
              <Text color="magenta">Blackout (1)</Text>
            </Box>
            <Box borderStyle="round" borderColor="red" paddingX={1}>
              <Text color="red">Wrong (2)</Text>
            </Box>
            <Box borderStyle="round" borderColor="yellow" paddingX={1}>
              <Text color="yellow">Hard (3)</Text>
            </Box>
            <Box borderStyle="round" borderColor="green" paddingX={1}>
              <Text color="green">Good (4)</Text>
            </Box>
            <Box borderStyle="round" borderColor="cyan" paddingX={1}>
              <Text color="cyan">Easy (5)</Text>
            </Box>
          </Box>

          {/* Help footer */}
          <Box marginTop={1}>
            <Text dimColor>
              1-5: Rate Card    b: Back to Decks    q: Quit
            </Text>
          </Box>
        </>
      ) : (
        <Box marginTop={1}>
          <Text dimColor>
            Press SPACE to reveal answer    b: Back to Decks    q: Quit
          </Text>
        </Box>
      )}
    </Box>
  );
};
