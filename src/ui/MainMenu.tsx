import React from "react";
import {Box, Text} from "ink";
import SelectInput from "ink-select-input";
import {CardStore} from "../store/CardStore.js";

interface MainMenuProps {
  store: CardStore;
  onNavigate: (screen: "study" | "browse" | "stats") => void;
}

interface MenuItem {
  label: string;
  value: "study" | "browse" | "stats" | "quit";
}

const MainMenu: React.FC<MainMenuProps> = ({store, onNavigate}) => {
  const stats = store.getStats();
  const studyCount = stats.dueCards + stats.newCards;

  const items: MenuItem[] = [
    {label: `Study (${studyCount} cards)`, value: "study"},
    {label: "Browse Decks", value: "browse"},
    {label: "Statistics", value: "stats"},
    {label: "Quit", value: "quit"}
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value === "quit") {
      process.exit(0);
    } else {
      onNavigate(item.value);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} flexDirection="column">
        <Text color="cyan">$$$$$$$\  $$$$$$$\  $$$$$$\ $$\       $$\       </Text>
        <Text color="cyan">$$  __$$\ $$  __$$\ \_$$  _|$$ |      $$ |      </Text>
        <Text color="cyan">$$ |  $$ |$$ |  $$ |  $$ |  $$ |      $$ |      </Text>
        <Text color="cyan">$$ |  $$ |$$$$$$$  |  $$ |  $$ |      $$ |      </Text>
        <Text color="cyan">$$ |  $$ |$$  __$$&lt;   $$ |  $$ |      $$ |      </Text>
        <Text color="cyan">$$ |  $$ |$$ |  $$ |  $$ |  $$ |      $$ |      </Text>
        <Text color="cyan">$$$$$$$  |$$ |  $$ |$$$$$$\ $$$$$$$$\ $$$$$$$$\ </Text>
        <Text color="cyan">\_______/ \__|  \__|\______|\________|\________|</Text>
        <Text dimColor>Spaced Repetition System</Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        <Text>
          Total cards: <Text color="green">{stats.totalCards}</Text>
        </Text>
        <Text>
          Due today: <Text color="yellow">{stats.dueCards}</Text>
        </Text>
        <Text>
          New cards: <Text color="blue">{stats.newCards}</Text>
        </Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
};

export default MainMenu;
