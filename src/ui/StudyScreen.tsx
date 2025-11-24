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
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    loadNextCard();
  }, []);

  const loadNextCard = () => {
    const due = store.getDueCards(deckName);
    const newCards = store.getNewCards(deckName);
    const cards = [...due, ...newCards];
    setDueCards(cards);
    
    if (cards.length > 0) {
      setCurrentCard(cards[0]);
      setShowAnswer(false);
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
    });
    
    await store.saveCard(updated);
    setReviewed(reviewed + 1);
    loadNextCard();
  };

  useInput((input) => {
    if (input === 'q') {
      onExit();
      return;
    }

    if (!currentCard) return;

    if (input === ' ' && !showAnswer) {
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
      <Box marginBottom={1}>
        <Text dimColor>
          {deckName || 'All decks'} • Due: {dueCards.length} • Reviewed: {reviewed}
        </Text>
      </Box>

      <Box borderStyle="round" borderColor="blue" padding={1} marginBottom={1}>
        <Text bold>{currentCard.question}</Text>
      </Box>

      {showAnswer && (
        <>
          <Box borderStyle="round" borderColor="green" padding={1} marginBottom={1}>
            <Text>{currentCard.answer}</Text>
          </Box>

          <Box flexDirection="column" marginBottom={1}>
            <Text bold>Rate your recall:</Text>
            <Text dimColor>1 - Blackout (no recall)</Text>
            <Text dimColor>2 - Wrong (incorrect response)</Text>
            <Text dimColor>3 - Hard (difficult recall)</Text>
            <Text dimColor>4 - Good (correct with effort)</Text>
            <Text dimColor>5 - Easy (perfect recall)</Text>
          </Box>
        </>
      )}

      <Box marginTop={1}>
        <Text dimColor>
          {showAnswer ? 'Press 1-5 to rate • ' : 'Press SPACE to reveal answer • '}
          Press 'q' to quit
        </Text>
      </Box>
    </Box>
  );
};
