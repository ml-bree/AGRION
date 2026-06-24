import { GenUIRenderer } from "./components/genui";
import { useGenUI } from "./hooks/useGenUI";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function App() {
  // Demo session; in a real app this comes from routing or auth.
  const { blocks, loading, error } = useGenUI("demo");
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <main className="min-h-screen bg-cream dark:bg-dark-bg p-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          {/* Header with Dark Mode Toggle */}
          <header className="flex justify-between items-center border-b border-sand dark:border-dark-border pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-thunder dark:text-dark-text flex items-center gap-2">
                <span className="text-marigold dark:text-dark-accent">🌾</span> 
                AgriConnect <span className="text-copper dark:text-dark-text3">Nigeria</span>
              </h1>
              <p className="text-sm text-dallas dark:text-dark-text2">
                Advisory dashboard — generative UI from the farming knowledge graph.
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-sand dark:border-dark-border bg-white dark:bg-dark-surface text-thunder dark:text-dark-text hover:bg-cream dark:hover:bg-dark-bg2 transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </header>

          {loading && <p className="text-dallas dark:text-dark-text2">Loading advisory…</p>}
          {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}

          <div className="space-y-4">
            {blocks.map((block, i) => (
              <GenUIRenderer key={i} block={block} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}