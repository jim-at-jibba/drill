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
  const [selectedIndex, setSelectedIndex] = useState(0);

  const deckNames = Array.from(store.decks.keys());

  useInput((input, key) => {
    if (input === 'q' || input === 'b') {
      onExit();
      return;
    }

    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }

    if (key.downArrow && selectedIndex < deckNames.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }

    if (key.return && deckNames[selectedIndex]) {
      onStudyDeck(deckNames[selectedIndex]);
    }
  });

  const formatLastStudied = (date: Date | null): string => {
    if (!date) return 'Never';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const studiedDate = new Date(date);
    studiedDate.setHours(0, 0, 0, 0);
    
    if (studiedDate.getTime() === today.getTime()) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (studiedDate.getTime() === yesterday.getTime()) return 'Yesterday';
    
    const daysAgo = Math.floor((today.getTime() - studiedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) return `${daysAgo}d ago`;
    
    return studiedDate.toLocaleDateString();
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Browse Decks</Text>
      </Box>

      {deckNames.length === 0 ? (
        <>
          <Text dimColor>No decks found</Text>
          <Box marginTop={1}>
            <Text dimColor>Press 'q' to return to menu</Text>
          </Box>
        </>
      ) : (
        <>
          {/* Table header */}
          <Box marginBottom={1}>
            <Box width={30}>
              <Text bold>DECK NAME</Text>
            </Box>
            <Box width={15}>
              <Text bold>CARDS</Text>
            </Box>
            <Box width={15}>
              <Text bold>DUE</Text>
            </Box>
            <Box width={20}>
              <Text bold>LAST STUDIED</Text>
            </Box>
          </Box>

          {/* Table rows */}
          {deckNames.map((name, index) => {
            const deck = store.decks.get(name);
            const stats = store.getStats(name);
            const isSelected = index === selectedIndex;

            return (
              <Box key={name}>
                <Box width={30}>
                  <Text color={isSelected ? 'green' : undefined}>
                    {isSelected ? '> ' : '  '}{name}
                  </Text>
                </Box>
                <Box width={15}>
                  <Text>{stats.totalCards}</Text>
                </Box>
                <Box width={15}>
                  <Text>{stats.dueCards}</Text>
                </Box>
                <Box width={20}>
                  <Text>{formatLastStudied(deck?.lastStudied || null)}</Text>
                </Box>
              </Box>
            );
          })}

          {/* Pagination info */}
          <Box marginTop={1} marginBottom={1}>
            <Text dimColor>Page 1 of 1</Text>
          </Box>

          {/* Help footer */}
          <Box marginTop={1}>
            <Text dimColor>
              ↑/↓: Navigate    Enter: Study    b: Back    q: Quit
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};
