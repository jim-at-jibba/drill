import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
const MainMenu = ({ store, onNavigate }) => {
    const stats = store.getStats();
    const items = [
        { label: `Study (${stats.dueCards} due)`, value: "study" },
        { label: "Browse Decks", value: "browse" },
        { label: "Statistics", value: "stats" },
        { label: "Quit", value: "quit" }
    ];
    const handleSelect = (item) => {
        if (item.value === "quit") {
            process.exit(0);
        }
        else {
            onNavigate(item.value);
        }
    };
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, color: "cyan", children: "drill - Spaced Repetition System" }) }), _jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsxs(Text, { children: ["Total cards: ", _jsx(Text, { color: "green", children: stats.totalCards })] }), _jsxs(Text, { children: ["Due today: ", _jsx(Text, { color: "yellow", children: stats.dueCards })] }), _jsxs(Text, { children: ["New cards: ", _jsx(Text, { color: "blue", children: stats.newCards })] })] }), _jsx(SelectInput, { items: items, onSelect: handleSelect })] }));
};
export default MainMenu;
