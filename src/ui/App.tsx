import React, {useState, useEffect} from "react";
import {Box, Text} from "ink";
import Spinner from "ink-spinner";
import {resolveBaseDir, ensureBaseDirExists} from "../utils/config.js";
import {CardStore} from "../store/CardStore.js";
import MainMenu from "./MainMenu.js";
import {StudyScreen} from "./StudyScreen.js";
import {BrowseDecks} from "./BrowseDecks.js";
import {StatsScreen} from "./StatsScreen.js";

type Screen = "main-menu" | "study" | "browse" | "stats";

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("main-menu");
  const [store, setStore] = useState<CardStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyDeckName, setStudyDeckName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const baseDir = resolveBaseDir();
        ensureBaseDirExists(baseDir);
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

  const handleStudyDeck = (deckName: string) => {
    setStudyDeckName(deckName);
    setScreen("study");
  };

  const handleExitStudy = () => {
    setStudyDeckName(undefined);
    setScreen("main-menu");
  };

  switch (screen) {
    case "main-menu":
      return <MainMenu store={store} onNavigate={setScreen} />;
    case "study":
      return <StudyScreen store={store} deckName={studyDeckName} onExit={handleExitStudy} />;
    case "browse":
      return (
        <BrowseDecks
          store={store}
          onStudyDeck={handleStudyDeck}
          onExit={() => setScreen("main-menu")}
        />
      );
    case "stats":
      return <StatsScreen store={store} onExit={() => setScreen("main-menu")} />;
    default:
      return <Text>Unknown screen</Text>;
  }
};

export default App;
