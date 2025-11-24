import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { CardStore } from '../store/CardStore.js';

interface BrowseDecksProps {
  store: CardStore;
  onStudyDeck: (deckName: string) => void;
  onExit: () => void;
}

interface DeckItem {
  label: string;
  value: string;
}

export const BrowseDecks: React.FC<BrowseDecksProps> = ({ store, onStudyDeck, onExit }) => {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

  const deckNames = Array.from(store.decks.keys());

  useInput((input) => {
    if (input === 'q' || input === 'b') {
      if (selectedDeck) {
        setSelectedDeck(null);
      } else {
        onExit();
      }
    }

    if (input === 's' && selectedDeck) {
      onStudyDeck(selectedDeck);
    }
  });

  if (!selectedDeck) {
    const items: DeckItem[] = deckNames.map((name) => ({
      label: name,
      value: name,
    }));

    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">
            Browse Decks
          </Text>
        </Box>

        {items.length === 0 ? (
          <>
            <Text dimColor>No decks found</Text>
            <Box marginTop={1}>
              <Text dimColor>Press 'q' to return to menu</Text>
            </Box>
          </>
        ) : (
          <>
            <SelectInput items={items} onSelect={(item) => setSelectedDeck(item.value)} />
            <Box marginTop={1}>
              <Text dimColor>Select deck to view details • Press 'q' to return</Text>
            </Box>
          </>
        )}
      </Box>
    );
  }

  // Deck detail view
  const stats = store.getStats(selectedDeck);
  const deck = store.decks.get(selectedDeck);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        {selectedDeck}
      </Text>

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>
          Total cards: <Text color="green">{stats.totalCards}</Text>
        </Text>
        <Text>
          Due today: <Text color="yellow">{stats.dueCards}</Text>
        </Text>
        <Text>
          New cards: <Text color="blue">{stats.newCards}</Text>
        </Text>
        <Text>
          Learning: <Text color="magenta">{stats.learningCards}</Text>
        </Text>
        <Text>
          Mature: <Text color="cyan">{stats.matureCards}</Text>
        </Text>
      </Box>

      {deck && (
        <Box marginBottom={1}>
          <Text dimColor>Path: {deck.path}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press 's' to study this deck • Press 'b' to go back • Press 'q' to menu</Text>
      </Box>
    </Box>
  );
};
