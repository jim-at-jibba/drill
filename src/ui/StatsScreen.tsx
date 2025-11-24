import React from 'react';
import { Box, Text, useInput } from 'ink';
import { CardStore } from '../store/CardStore.js';

interface StatsScreenProps {
  store: CardStore;
  onExit: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ store, onExit }) => {
  const stats = store.getStats();

  useInput((input) => {
    if (input === 'q') {
      onExit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Statistics
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Global Stats</Text>
        <Box marginLeft={2} flexDirection="column" marginTop={1}>
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
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>By Deck</Text>
        <Box marginLeft={2} flexDirection="column" marginTop={1}>
          {Array.from(store.decks.entries()).map(([name, deck]) => {
            const deckStats = deck.getStats();
            return (
              <Box key={name} flexDirection="column" marginBottom={1}>
                <Text bold dimColor>
                  {name}
                </Text>
                <Box marginLeft={2}>
                  <Text dimColor>
                    {deckStats.totalCards} total • {deckStats.dueCards} due • {deckStats.newCards} new
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press 'q' to return to menu</Text>
      </Box>
    </Box>
  );
};
