import React, {useState, useEffect} from "react";
import {Box, Text} from "ink";
import Spinner from "ink-spinner";
import {resolveBaseDir} from "../utils/config.js";
import {CardStore} from "../store/CardStore.js";
import MainMenu from "./MainMenu.js";

type Screen = "main-menu" | "study" | "browse" | "stats";

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("main-menu");
  const [store, setStore] = useState<CardStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const baseDir = resolveBaseDir();
        const cardStore = new CardStore(baseDir);
        await cardStore.loadDecks();
        setStore(cardStore);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load decks");
        setLoading(false);
      }
    };

    loadStore();
  }, []);

  if (loading) {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Loading decks...
        </Text>
      </Box>
    );
  }

  if (error || !store) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error || "Store not initialized"}</Text>
      </Box>
    );
  }

  switch (screen) {
    case "main-menu":
      return <MainMenu store={store} onNavigate={setScreen} />;
    case "study":
      return <Text>Study Screen (TODO)</Text>;
    case "browse":
      return <Text>Browse Decks Screen (TODO)</Text>;
    case "stats":
      return <Text>Stats Screen (TODO)</Text>;
    default:
      return <Text>Unknown screen</Text>;
  }
};

export default App;
