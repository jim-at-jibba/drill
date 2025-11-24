import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { resolveBaseDir } from "../utils/config.js";
import { CardStore } from "../store/CardStore.js";
import MainMenu from "./MainMenu.js";
const App = () => {
    const [screen, setScreen] = useState("main-menu");
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadStore = async () => {
            try {
                const baseDir = resolveBaseDir();
                const cardStore = new CardStore(baseDir);
                await cardStore.loadDecks();
                setStore(cardStore);
                setLoading(false);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load decks");
                setLoading(false);
            }
        };
        loadStore();
    }, []);
    if (loading) {
        return (_jsx(Box, { children: _jsxs(Text, { color: "cyan", children: [_jsx(Spinner, { type: "dots" }), " Loading decks..."] }) }));
    }
    if (error || !store) {
        return (_jsx(Box, { flexDirection: "column", children: _jsxs(Text, { color: "red", children: ["Error: ", error || "Store not initialized"] }) }));
    }
    switch (screen) {
        case "main-menu":
            return _jsx(MainMenu, { store: store, onNavigate: setScreen });
        case "study":
            return _jsx(Text, { children: "Study Screen (TODO)" });
        case "browse":
            return _jsx(Text, { children: "Browse Decks Screen (TODO)" });
        case "stats":
            return _jsx(Text, { children: "Stats Screen (TODO)" });
        default:
            return _jsx(Text, { children: "Unknown screen" });
    }
};
export default App;
